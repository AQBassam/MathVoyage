# نشر فُرسان الحساب على VPS

الخادم: Contabo · Ubuntu 24.04 · nginx على المضيف + certbot · Docker (`docker.io`) + Compose v2.
النطاق: `fursan.bassamailab.xyz` ← `161.97.99.78` (IPv4 فقط).

## البنية

```
الإنترنت ─443→ nginx (المضيف) ─→ 127.0.0.1:3100 ─→ fursan-app-1 :3000
                                                      └─(شبكة internal)─→ fursan-db-1 :5432
```

- قاعدة البيانات بلا أي منفذ منشور، وعلى شبكة Docker داخلية لا تصل إلى الإنترنت.
- التطبيق يتصل بقاعدة البيانات بالدور `fursan_app` (قراءة وكتابة صفوف فقط). الجداول يملكها `fursan_admin` الذي تستخدمه الـmigrations وحدها.
- لا تُمس إعدادات n8n أو OpenClaw أو Hermes أو filebrowser.

## النشر لأول مرة

### 1. جلب الكود

```bash
git clone https://github.com/AQBassam/MathVoyage.git /opt/fursan
cd /opt/fursan
```

### 2. ملف البيئة (الأسرار تُولَّد ولا تظهر على الشاشة)

```bash
cd /opt/fursan
umask 077
cat > .env <<EOF
DB_NAME=fursan
DB_ADMIN_USER=fursan_admin
DB_ADMIN_PASSWORD=$(openssl rand -hex 32)
DB_APP_USER=fursan_app
DB_APP_PASSWORD=$(openssl rand -hex 32)
SESSION_SECRET=$(openssl rand -hex 32)
APP_PORT=3100
EOF
ls -l .env      # المتوقع: -rw------- root root
```

> `SESSION_SECRET` يوقّع هوية الزوار. تغييره يجعل كل زائر حالي يبدأ بهوية جديدة.

### 3. البناء ثم التشغيل بالترتيب

```bash
docker compose build
docker compose up -d db
docker compose ps db                 # انتظر حتى تظهر (healthy)
docker compose run --rm migrate      # ينشئ الجداول
docker compose up -d app
```

### 4. التحقق المحلي قبل nginx

```bash
curl -s http://127.0.0.1:3100/api/health        # {"ok":true}
sudo ss -tlnp | grep 3100                        # 127.0.0.1:3100 فقط
docker compose logs --tail 20 app
```

### 5. nginx (ملف جديد فقط)

```bash
sudo tar czf /root/nginx-backup-$(date +%F-%H%M).tgz -C /etc nginx
sudo cp deploy/nginx/fursan.bassamailab.xyz /etc/nginx/sites-available/
sudo ln -s /etc/nginx/sites-available/fursan.bassamailab.xyz /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
curl -sI http://fursan.bassamailab.xyz | head -1     # HTTP/1.1 200 OK
```

إن فشل `nginx -t` فلا تُعد التحميل؛ احذف الرابط الرمزي وأرسل الخطأ.

### 6. الشهادة

```bash
sudo certbot --nginx -d fursan.bassamailab.xyz --redirect
curl -sI https://fursan.bassamailab.xyz | head -1    # HTTP/1.1 200 OK
```

### 7. التأكد من أن الخدمات القائمة لم تتأثر

```bash
for h in n8n atlas files; do printf '%s: ' $h; curl -s -o /dev/null -w '%{http_code}\n' https://$h.bassamailab.xyz; done
```

### 8. النسخ الاحتياطي اليومي

```bash
/opt/fursan/deploy/backup.sh          # تجربة يدوية أولى
echo '30 0 * * * root /opt/fursan/deploy/backup.sh >> /var/log/fursan-backup.log 2>&1' \
  | sudo tee /etc/cron.d/fursan-backup
```

00:30 UTC = 04:30 بتوقيت مسقط. النسخ في `/opt/fursan-backups`، ويُحتفظ بآخر 14 يومًا.

## التحديث لاحقًا

```bash
cd /opt/fursan
git pull
docker compose build app
docker compose run --rm migrate
docker compose up -d app
```

## الاسترجاع من نسخة احتياطية

```bash
cd /opt/fursan
docker compose stop app
docker compose exec -T db sh -c 'pg_restore -U "$POSTGRES_USER" -d "$POSTGRES_DB" --clean --if-exists' \
  < /opt/fursan-backups/fursan-YYYY-MM-DD-HHMM.dump
docker compose start app
```

## التراجع الكامل

```bash
sudo rm /etc/nginx/sites-enabled/fursan.bassamailab.xyz && sudo nginx -t && sudo systemctl reload nginx
cd /opt/fursan && docker compose down        # يحتفظ ببيانات القاعدة (volume)
```

`docker compose down -v` يحذف البيانات نهائيًا — لا يُستخدم إلا عن قصد.

## تسجيل الدخول بحساب Google (اختياري)

يعمل التطبيق كاملًا للزوار دون تسجيل. ليعمل زر Google على النطاق الجديد، أضف
`fursan.bassamailab.xyz` إلى Firebase Console ← Authentication ← Settings ← Authorized domains
للمشروع `gen-lang-client-0115741681`.
