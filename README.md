# Akane commission website

- `index.html` / `queue.html`: existing queue dashboard
- `gallery.html`: commission and artwork gallery
- `admin.html`: gallery draft editor
- `shop.html` / `admin-shop.html`: existing Adoptable shop

## Publish artwork and commission updates

1. In Admin, save edits and choose **ส่งออกข้อมูลสำหรับ GitHub**.
2. Keep the exported JSON as a backup outside the public repository.
3. Run `python3 import-site-data.py /path/to/akane-site-export.json`.
4. Commit `site-data.json`, `media/`, and website changes, then push to the Pages branch.
5. Verify the public gallery before removing local preview data.

GitHub Pages serves static files. Admin saves are browser-local drafts; publishing the export is required for other visitors to see updates. The 2314 PIN is a convenience gate, not server authentication. Never store secrets in these public files.
