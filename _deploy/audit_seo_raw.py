import urllib.request, ssl, re, json
ctx=ssl.create_default_context(); ctx.check_hostname=False; ctx.verify_mode=ssl.CERT_NONE
urls=[
 "https://3mpwrapp.ca/","https://3mpwrapp.ca/privacy/","https://3mpwrapp.ca/terms/",
 "https://3mpwrapp.ca/code-of-conduct/","https://3mpwrapp.ca/data-ownership/","https://3mpwrapp.ca/faq/",
 "https://3mpwrapp.ca/accessibility","https://3mpwrapp.ca/app-tour/","https://3mpwrapp.ca/contact","https://3mpwrapp.ca/support"
]
out={}
for u in urls:
    try:
        req=urllib.request.Request(u,headers={'User-Agent':'Mozilla/5.0'})
        html=urllib.request.urlopen(req,timeout=40,context=ctx).read().decode('utf-8','ignore')
    except Exception as e:
        out[u]={'error':str(e)[:160]}; print("ERR",u,str(e)[:80]); continue
    title=re.search(r'<title>(.*?)</title>',html,re.S)
    desc=re.search(r'<meta[^>]+name=["\']description["\'][^>]+content=["\'](.*?)["\']',html,re.S)
    if not desc: desc=re.search(r'<meta[^>]+content=["\'](.*?)["\'][^>]+name=["\']description["\']',html,re.S)
    og=len(re.findall(r'<meta[^>]+property=["\']og:',html))
    tw=len(re.findall(r'<meta[^>]+name=["\']twitter:',html))
    jsonld=html.count('application/ld+json')
    h1=len(re.findall(r'<h1[\s>]',html))
    h1txt=re.findall(r'<h1[^>]*>(.*?)</h1>',html,re.S)
    h1txt=[re.sub(r'<[^>]+>','',x).strip() for x in h1txt]
    imgs=re.findall(r'<img\b[^>]*>',html)
    noalt=sum(1 for i in imgs if not re.search(r'alt=["\']',i) or re.search(r'alt=["\']["\']',i))
    h2=len(re.findall(r'<h2[\s>]',html))
    out[u]={
      'len':len(html),'title':title.group(1).strip() if title else None,
      'titleLen':len(title.group(1)) if title else 0,
      'desc':desc.group(1).strip()[:220] if desc else None,
      'descLen':len(desc.group(1)) if desc else 0,
      'og':og,'tw':tw,'jsonld':jsonld,'h1':h1,'h1txt':h1txt[:5],'h2':h2,'imgs':len(imgs),'noalt':noalt
    }
    print(f"{u}\n  title({out[u]['titleLen']}): {out[u]['title']}\n  desc({out[u]['descLen']}): {out[u]['desc']}\n  og={og} tw={tw} jsonld={jsonld} h1={h1} {out[u]['h1txt']} h2={h2} imgs={len(imgs)} noalt={noalt}")
json.dump(out,open('audit_seo_raw.json','w'),indent=2)
print("\nSAVED audit_seo_raw.json")
