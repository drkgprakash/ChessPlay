#!/usr/bin/env python3
import os
import sys
import urllib.request

URL = "https://srv878-files.hstgr.io/rest/a934350ec3f1cb94/api/tus/public_html"
AUTH = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoxLCJsb2NhbGUiOiJlbl9VUyIsInZpZXdNb2RlIjoibGlzdCIsInNpbmdsZUNsaWNrIjpmYWxzZSwicmVkaXJlY3RBZnRlckNvcHlNb3ZlIjpmYWxzZSwicGVybSI6eyJhZG1pbiI6ZmFsc2UsImV4ZWN1dGUiOmZhbHNlLCJjcmVhdGUiOnRydWUsInJlbmFtZSI6dHJ1ZSwibW9kaWZ5Ijp0cnVlLCJkZWxldGUiOnRydWUsInNoYXJlIjpmYWxzZSwiZG93bmxvYWQiOnRydWV9LCJjb21tYW5kcyI6W10sImxvY2tQYXNzd29yZCI6dHJ1ZSwiaGlkZURvdGZpbGVzIjpmYWxzZSwiZGF0ZUZvcm1hdCI6ZmFsc2UsInVzZXJuYW1lIjoidTU4NjAyMjY0OCIsImFjZUVkaXRvclRoZW1lIjoiIn0sImlzcyI6IkZpbGUgQnJvd3NlciIsImV4cCI6MTc4ODYwNzY2NywiaWF0IjoxNzg4NTg2MDY3fQ.lH0PAhqjnbyMffAHClUtrxtV6rSAf6NUr6oWHygEgts"
REST_AUTH = "821e5a9b39dc8596cd969a608d92983794072bbf6377d242cf7b272fd54ec6ad-a934350ec3f1cb94"

DIST_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../apps/app/dist"))

def upload_file(local_path, remote_rel_path):
    size = os.path.getsize(local_path)
    post_headers = {
        'X-Auth': AUTH,
        'X-Auth-Rest': REST_AUTH,
        'Tus-Resumable': '1.0.0',
        'Upload-Length': str(size),
        'Upload-Offset': '0'
    }
    
    encoded_dest = urllib.parse.quote(remote_rel_path, safe='/')
    req = urllib.request.Request(f"{URL}/{encoded_dest}?override=true", method='POST', headers=post_headers)
    try:
        with urllib.request.urlopen(req) as resp:
            pass
    except Exception as e:
        print(f"Error initiating {remote_rel_path}: {e}")
        return False

    with open(local_path, 'rb') as f:
        data = f.read()

    patch_headers = {
        'X-Auth': AUTH,
        'X-Auth-Rest': REST_AUTH,
        'Tus-Resumable': '1.0.0',
        'Content-Type': 'application/offset+octet-stream',
        'Upload-Offset': '0'
    }
    req2 = urllib.request.Request(f"{URL}/{encoded_dest}?override=true", data=data, method='PATCH', headers=patch_headers)
    try:
        with urllib.request.urlopen(req2) as resp:
            print(f"✓ Uploaded: {remote_rel_path} ({size} bytes)")
            return True
    except Exception as e:
        print(f"Error uploading {remote_rel_path}: {e}")
        return False

def main():
    print(f"Uploading files from {DIST_DIR} to Hostinger public_html/app/ ...")
    success = 0
    total = 0
    for root, dirs, files in os.walk(DIST_DIR):
        for file in files:
            if file.startswith('.'):
                continue
            local_file = os.path.join(root, file)
            rel_path = os.path.relpath(local_file, DIST_DIR)
            remote_path = f"app/{rel_path}"
            total += 1
            if upload_file(local_file, remote_path):
                success += 1
    print(f"\nDone! Successfully deployed {success}/{total} files to Hostinger.")

if __name__ == '__main__':
    main()
