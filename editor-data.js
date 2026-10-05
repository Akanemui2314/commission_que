/* Patch saves retain all existing site content and use the cloud revision guard. */
(() => {
  window.AkaneEditorData = {
    authReady(fn) {
      return window.AkaneAuth.subscribe(fn);
    },
    errorMessage(error) {
      return window.AkaneCloud.errorMessage(error);
    },
    async loadFresh() {
      await window.AkaneAuth.requireOwner();
      const data = await window.AkaneCloud.load();
      if (!data) throw new Error('ยังไม่มีข้อมูลเว็บไซต์ กรุณาบันทึกข้อมูลตั้งต้นใน Admin ก่อน');
      return data;
    },
    async save(patch) {
      await window.AkaneAuth.requireOwner();
      const current = await this.loadFresh();
      await window.AkaneCloud.save({ ...current, ...patch });
    },
  };
})();
