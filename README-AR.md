# موقع الطبيب الشخصي + الداش بورد

موقع بريميم لطالب طب بشري / صانع محتوى + داش بورد كامل للتحكم في كل حاجة.
كل حاجة مجانية 100%: Vercel + Firebase + Cloudinary.

---

## 1) تشغيل المشروع على جهازك

```bash
# 1. نزل Node.js من nodejs.org (لو مش موجود)
# 2. فك الضغط عن الفولدر وافتح الترمينال جواه
npm install
npm run dev
# الموقع: http://localhost:3000
# الداش بورد: http://localhost:3000/admin
```

> قبل ما تحط إعدادات Firebase هتلاقي الموقع شغال ببيانات تجريبية جاهزة.

---

## 2) إعداد Firebase (قاعدة البيانات + الدخول)

1. ادخل console.firebase.google.com وسجل بحساب Google
2. **Add project** → اكتب أي اسم → ممكن تعمل Google Analytics Off
3. من القايمة الجانبية افتح **Authentication → Sign-in method → Email/Password → Enable**
4. **Authentication → Users → Add user** → ضيف الإيميل والباسورد اللي هتدخل بيهم الداش بورد
5. **Firestore Database → Create database → Production mode → اختار أقرب سيرفر**
6. افتح تبويب **Rules** وانسخ محتوى ملف `firestore.rules` الموجود في المشروع واعمل **Publish**
   (القاعدة: أي حد يقدر يقرأ، وأنت بس اللي تقدر تكتب بعد الدخول)
7. **Project settings (⚙️) → Your apps → Web `</>`** → سجل أي اسم → هيديك كود فيه القيم
8. اعمل نسخة من `.env.example` وسميها `.env.local` وحط القيم:

```
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=اسم-المشروع.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=اسم-المشروع
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=اسم-المشروع.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=1:...
```

9. اعمل restart للسيرفر (Ctrl+C وبعدين `npm run dev`)

---

## 3) إعداد Cloudinary (رفع الصور — مجاني بدون فيزا)

1. ادخل cloudinary.com وسجل حساب مجاني
2. من فوق اضغط على بريدك → **Account** → هتلاقي **Cloud name** (انسخه)
3. **Settings → Upload → Upload presets → Add upload preset**:
   - Signing mode = **Unsigned**
   - Save
4. حط الاتنين في `.env.local`:

```
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=اسمك
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=البريسيت اللي عملته
```

كده رفع الصور من الداش بورد هيشتغل فوراً.

---

## 4) النشر على Vercel (مجاني)

1. اعمل حساب على github.com واعمل **New repository** وارفع المشروع عليه
   (الملفات السرية `.env.local` متجاهلة أصلاً — متترفعش)
2. ادخل vercel.com وسجل بحساب GitHub
3. **Add New → Project** → اختار الريبو → **Deploy**
4. بعد النشر: **Project → Settings → Environment Variables** → ضيف كل المتغيرات
   اللي في `.env.local` (نفس الأسماء بالظبط)
5. **Redeploy** — خلاص، موقعك على النت بشكل مجاني تماماً

---

## 5) ملاحظات مهمة

- **الداش بورد** على `/admin` — محمي بإيميلك وباسوردك اللي عملتهم في Firebase
- أي تعديل في الداش بورد بيظهر في الموقع **فوراً** (تحديث مباشر)
- لو عايز تغير الألوان أو الخطوط: ملف `tailwind.config.js`
- الفري تيرز المجانية كفاية جداً لموقع شخصي بعشرات الآلاف من الزيارات

---

## 🚨 حل مشكلة "التعديلات مش بتتحفظ"

لو بتعدّل في الادمن وبتدوس «حفظ» لكن مفيش حاجة بتتحفظ (أو بيظهرلك خطأ
`PERMISSION_DENIED`)، المشكلة غالبًا في **قواعد Firestore Rules** مش منشورة.
اتبع ده بالظبط:

### الخطوة 1: افتح قواعد Firestore
1. ادخل [console.firebase.google.com](https://console.firebase.google.com)
2. اختار مشروعك
3. من القايمة الجانبية: **Firestore Database → Rules**

### الخطوة 2: الصق الكود ده بالظبط

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // القراءة للكل، الكتابة للمشرف المسجّل دخول بس
    match /{document=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

### الخطوة 3: دوس **Publish**

استنى ثانية، جرّب تاني تعمل تعديل وحفظ من `/admin`. لازم تظهرلك رسالة
`✅ تم الحفظ بنجاح`.

### لو لسه مشتغلش

- اتأكد إنك **مسجّل دخول** في `/admin` (لو مش مسجّل، الادمن هيطلب منك تسجيل)
- اعمل refresh للصفحة (Ctrl+Shift+R)
- افتح **Developer Tools (F12) → Console** وشوف لو فيه رسالة خطأ حمراء
- لو فيه رسالة `PERMISSION_DENIED` → القواعد لسه مش منشورة صح

---

## 6) تبويبات الادمن الجديدة

في `/admin` هتلاقي تبويب اسمه **«النصوص والخطوط»** جواه 3 تبويبات فرعية:

1. **كل النصوص**: عدّل أي نص في الموقع — الهيدر، الهيرو، عناوين الأقسام،
   الجملة الوسطى، الفوتر، الشريط المتحرك، أزرار CTA، إلخ.
2. **الخطوط والأحجام**: 15 حجم قابل للتعديل بـ sliders + مضاعف عام يكبّر
   أو يصغّر كل الأحجام مع بعض.
3. **الإحصائيات والسوشيال**: ضيف/عدّل/امسح الإحصائيات + لينكات السوشيال.

دوس **«💾 حفظ كل التعديلات** في أي وقت عشان تظهر التعديلات على الموقع.

