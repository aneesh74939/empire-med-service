#!/usr/bin/env python3
"""Regenerates the self-hosted web fonts. Not part of the normal build.
Needs fontTools plus system copies of Poppins and Inter (both SIL OFL 1.1)."""
from fontTools.ttLib import TTFont
from fontTools import subset
G='/usr/share/fonts/truetype/google-fonts/'; I='/usr/share/fonts/opentype/inter/'
fonts={'poppins-500':G+'Poppins-Medium.ttf','poppins-700':G+'Poppins-Bold.ttf','inter-400':I+'Inter-Regular.otf','inter-600':I+'Inter-SemiBold.otf'}
uni=list(range(0x20,0x7f))+list(range(0xa0,0x100))+[0x2013,0x2014,0x2018,0x2019,0x201c,0x201d,0x2026,0x2022,0xb7]
for name,p in fonts.items():
    f=TTFont(p); o=subset.Options(); o.flavor='woff'; o.layout_features=['kern','liga','calt','tnum','ccmp','locl','mark','mkmk']; o.hinting=False
    s=subset.Subsetter(o); s.populate(unicodes=uni); s.subset(f); f.flavor='woff'; f.save(f'public/fonts/{name}.woff')
