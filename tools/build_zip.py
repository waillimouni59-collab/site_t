"""Crée dist/essentiel.zip, importable dans Shopify (Thèmes > Ajouter un thème > Importer un fichier zip)."""
import pathlib
import zipfile

ROOT = pathlib.Path(__file__).resolve().parent.parent
THEME_DIRS = ['assets', 'config', 'layout', 'locales', 'sections', 'snippets', 'templates']

out = ROOT / 'dist' / 'essentiel.zip'
out.parent.mkdir(exist_ok=True)
with zipfile.ZipFile(out, 'w', zipfile.ZIP_DEFLATED) as zf:
    for d in THEME_DIRS:
        for f in sorted((ROOT / d).rglob('*')):
            if f.is_file():
                zf.write(f, f.relative_to(ROOT).as_posix())
print(f'{out} ({out.stat().st_size // 1024} Ko)')
