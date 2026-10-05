/* Google identity is checked here and again by Firestore security rules. */
(() => {
  const OWNER = 'akanezz2314@gmail.com';
  const listeners = new Set();
  let auth,
    current = null,
    started = false,
    readyResolve;
  const ready = new Promise((resolve) => {
    readyResolve = resolve;
  });
  const isOwner = (user) =>
    Boolean(
      user &&
        user.emailVerified &&
        user.email?.toLowerCase() === OWNER &&
        user.providerData.some((p) => p.providerId === 'google.com'),
    );
  const api = (window.AkaneAuth = {
    ready,
    get user() {
      return current;
    },
    isOwner,
    subscribe(fn) {
      listeners.add(fn);
      ready.then(() => fn(current));
      return () => listeners.delete(fn);
    },
    async requireOwner() {
      await ready;
      if (!isOwner(current)) throw new Error('กรุณาเข้าสู่ระบบด้วยบัญชี Google เจ้าของก่อนบันทึก');
      return current;
    },
    async signIn() {
      await ready;
      const provider = new firebase.auth.GoogleAuthProvider();
      provider.setCustomParameters({ login_hint: OWNER, prompt: 'select_account' });
      const result = await auth.signInWithPopup(provider);
      if (!isOwner(result.user)) {
        await auth.signOut();
        throw new Error('บัญชีนี้ไม่มีสิทธิ์แก้ไขเว็บไซต์');
      }
      return result.user;
    },
    async signOut() {
      await ready;
      await auth.signOut();
    },
    show() {
      document.querySelector('.akane-google-gate')?.scrollIntoView({ block: 'center' });
    },
  });
  async function init() {
    if (started) return;
    started = true;
    try {
      if (!firebase.auth)
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://www.gstatic.com/firebasejs/8.10.1/firebase-auth.js';
          script.onload = resolve;
          script.onerror = () => reject(new Error('โหลด Google Login ไม่สำเร็จ กรุณารีเฟรชหน้า'));
          document.head.append(script);
        });
      auth = firebase.app().auth();
      await auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);
      auth.onAuthStateChanged((user) => {
        current = isOwner(user) ? user : null;
        document.body.classList.toggle('owner-authorized', Boolean(current));
        document.querySelector('.akane-google-gate')?.toggleAttribute('hidden', Boolean(current));
        document.querySelector('.akane-owner-logout')?.toggleAttribute('hidden', !current);
        readyResolve(current);
        for (const fn of listeners) fn(current);
        window.dispatchEvent(new Event('akane:auth'));
      });
    } catch (error) {
      readyResolve(null);
      document.querySelector('.akane-auth-status')?.replaceChildren(error.message);
    }
  }
  function mount() {
    const admin = /(?:admin|admin-shop|price-rate-admin|tos-admin)\.html$/.test(location.pathname);
    if (admin) {
      const style = document.createElement('style');
      style.textContent = `body:not(.owner-authorized) .admin-preview,body:not(.owner-authorized) .offers-admin,body:not(.owner-authorized) .tos-admin,body:not(.owner-authorized) #rate-page,body:not(.owner-authorized) #editor-tools,body:not(.owner-authorized) #editor-properties,body:not(.owner-authorized) #editor-add,body:not(.owner-authorized) .dashboard-container{display:none!important}.akane-google-gate{max-width:460px;margin:32px auto;padding:32px;border:2px solid #ffb7c5;border-radius:28px;background:#fffaf5;color:#5a4a42;font-family:system-ui}.akane-google-gate[hidden],.akane-owner-logout[hidden]{display:none}.akane-google-gate button,.akane-owner-logout{padding:12px 22px;border:1px solid #ffb7c5;border-radius:999px;background:#ffa6ba;color:#fff;font:inherit;cursor:pointer}.akane-owner-logout{position:fixed;bottom:18px;right:18px;z-index:10002}`;
      document.head.append(style);
      const gate = document.createElement('section');
      gate.className = 'akane-google-gate';
      const title = document.createElement('h1');
      title.textContent = 'Admin access';
      const text = document.createElement('p');
      text.textContent = 'เข้าสู่ระบบด้วย Google เพื่อแก้ไขและบันทึกข้อมูล';
      const sign = document.createElement('button');
      sign.type = 'button';
      sign.textContent = 'Continue with Google';
      const status = document.createElement('p');
      status.className = 'akane-auth-status';
      status.setAttribute('role', 'status');
      status.textContent = 'กำลังตรวจสอบบัญชี…';
      sign.onclick = async () => {
        sign.disabled = true;
        status.textContent = 'กำลังเข้าสู่ระบบ…';
        try {
          await api.signIn();
          status.textContent = 'เข้าสู่ระบบแล้ว';
        } catch (e) {
          status.textContent =
            e.code === 'auth/operation-not-allowed'
              ? 'ยังไม่ได้เปิด Google Login ใน Firebase'
              : e.message;
        } finally {
          sign.disabled = false;
        }
      };
      gate.append(title, text, sign, status);
      document.body.prepend(gate);
      const logout = document.createElement('button');
      logout.className = 'akane-owner-logout';
      logout.textContent = 'Log out';
      logout.hidden = true;
      logout.onclick = () => api.signOut();
      document.body.append(logout);
      ready.then(() => {
        if (!current) status.textContent = 'กรุณาเข้าสู่ระบบด้วยบัญชีเจ้าของ';
      });
    }
    init();
  }
  if (document.readyState === 'loading')
    document.addEventListener('DOMContentLoaded', mount, { once: true });
  else mount();
})();
