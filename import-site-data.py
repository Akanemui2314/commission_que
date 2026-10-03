"""Import an admin export: python3 import-site-data.py /path/akane-site-export.json"""
import base64,hashlib,json,sys
from pathlib import Path
root=Path(__file__).resolve().parent
source=Path(sys.argv[1]);data=json.loads(source.read_text())
assert isinstance(data,dict) and isinstance(data.get('artworks'),list) and isinstance(data.get('offers'),list),'Invalid website export'
media=root/'media';media.mkdir(exist_ok=True)
extensions={'image/png':'png','image/jpeg':'jpg','image/gif':'gif','image/webp':'webp','image/apng':'apng','video/mp4':'mp4','video/webm':'webm','video/quicktime':'mov'}
def asset(value):
 if not value:return value
 if not value.startswith('data:'):return value
 header,encoded=value.split(',',1);mime=header[5:].split(';')[0]
 if mime not in extensions:raise ValueError('Unsupported media type: '+mime)
 if ';base64' not in header:raise ValueError('Expected base64 media')
 blob=base64.b64decode(encoded,validate=True)
 if len(blob)>=100*1024*1024:raise ValueError('Media exceeds GitHub 100 MB file limit')
 name=hashlib.sha256(blob).hexdigest()[:24]+'.'+extensions[mime]
 (media/name).write_bytes(blob);return 'media/'+name
for art in data['artworks']:art['image']=asset(art.get('image'))
data['offers']=[offer for offer in data['offers'] if offer.get('status')!='hidden']
for offer in data['offers']:
 offer['images']=[asset(value) for value in offer.get('images',[])];offer.pop('cover',None)
(root/'site-data.json').write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
print(f"Imported {len(data['artworks'])} artworks and {len(data['offers'])} commissions.")
