import urllib.request, json
req = urllib.request.Request('http://localhost:8000/api/auth/signup', method='POST', headers={'Content-Type': 'application/json'}, data=json.dumps({'name':'test','email':'test@test.com','password':'testpassword'}).encode('utf-8'))
try:
    print(urllib.request.urlopen(req).read().decode('utf-8'))
except Exception as e:
    print("Error:", e)
    if hasattr(e, 'read'):
        print(e.read().decode('utf-8'))
