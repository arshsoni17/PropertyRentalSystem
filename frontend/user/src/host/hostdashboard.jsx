import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import HeaderHost from "../headerHost";
import Calendar from "../user/calender";
import { DayPicker } from "react-day-picker";
import { jwtDecode } from "jwt-decode";
const MAX_PHOTOS = 10;

const FIELDS = [
  { name: "title", label: "Property title", type: "text", span: 2 },
  { name: "city", label: "City", type: "text", span: 1 },
  { name: "price_per_night", label: "Price per night (₹)", type: "number", placeholder: "Decimal Upto 2 Places eg: 400.67", span: 1 },
  { name: "max_guests", label: "Max guests", type: "number", span: 1 },
];

export default function AddProperty() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    title: "", city: "", price_per_night: "", max_guests: "", description: "", rules: "",
  });
  const [photos, setPhotos] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  /////
  const [userRole, setUserRole] = useState("");
  if (userRole === "USER") { navigate("/home") };
  if (userRole === "ADMIN") { navigate("/admin") };
  const [userId, setUserId] = useState("");
  const [userName, setUserName] = useState("");
  /////
  const handleChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    setErrors((p) => ({ ...p, [e.target.name]: "" }));
  };

  const addFiles = (files) => {
    const incoming = Array.from(files).filter((f) => f.type.startsWith("image/"));
    const combined = [...photos, ...incoming].slice(0, MAX_PHOTOS);
    setPhotos(combined);
    setPreviews(combined.map((f) => URL.createObjectURL(f)));
    setErrors((p) => ({ ...p, photos: "" }));
  };

  const removePhoto = (i) => {
    const next = photos.filter((_, idx) => idx !== i);
    setPhotos(next);
    setPreviews(next.map((f) => URL.createObjectURL(f)));
  };

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = "Title is required";
    if (!form.city.trim()) e.city = "City is required";
    if (!form.description.trim()) e.description = "Description is required";
    if (!form.price_per_night || Number(form.price_per_night) <= 0)
      e.price_per_night = "Enter a valid price";
    if (!form.max_guests || Number(form.max_guests) < 1)
      e.max_guests = "At least 1 guest required";
    if (photos.length === 0) e.photos = "Upload at least 1 photo";
    return e;
  };
  //////////////////////////////////////////////////////////////////////
  // blocking of dates by host
  const [blockDates, setblockDates] = useState([]);
  const handleClearDates = () => {
    setblockDates([]);

  };
  console.log(blockDates);
  console.log(userName);
  console.log(userId);
  console.log(userRole);
  // //////////////////////////////////////////////////

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setSubmitting(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      photos.forEach((f) => fd.append("photos", f));

      const res = await fetch("http://localhost:3000/auth/user-host-properties", {
        method: "POST",
        headers: { token: localStorage.getItem("token") },
        body: fd,
      });

      ///////////////////////////////////////do blocking of dates here in handleSubmit 
      // const blockDatesResponse = await fetch("http://localhost:3000/auth/block-dates", {
      //   method: "POST",
      //   headers: { 'Content-Type': 'application/json', 'token': localStorage.getItem('token') },
      //   credentials: 'include',
      //   body: JSON.stringify({
      //     propertyId:""

      //   })
      // })
      // if (blockDatesResponse.ok) { console.log("blocking dates is wroking") }
      // else { return console.log("there is problem in the blockingDates") }
      ////////////////////////////////////////////

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed");
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setForm({ title: "", city: "", price_per_night: "", max_guests: "", description: "", rules: "" });
        setPhotos([]);
        setPreviews([]);
        setErrors({});
        navigate('/past/properties')
      }, 2000);
    } catch (err) {
      setErrors({ submit: err.message });
    } finally {
      setSubmitting(false);
    }
  };
  const cancelList = () => {
    setSuccess(false);
    setForm({ title: "", city: "", price_per_night: "", max_guests: "", description: "", rules: "" });
    setPhotos([]);
    setPreviews([]);
    setErrors({});
  }


  // Decoding of the token
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = jwtDecode(token);
        setUserRole(payload.userRole);
        setUserId(payload.userId);
        setUserName(payload.userName);
      }
      catch (error) {
        console.log(error);
      }
    }
  }, []);
  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <HeaderHost />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center p-12 bg-white rounded-3xl shadow-lg border border-gray-100 max-w-sm w-full mx-4">
            <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4 border border-green-200">
              <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">Property listed!</h2>
            <p className="text-sm text-gray-400">Redirecting to your listings…</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Page header ── */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
          <button
            onClick={() => navigate("/host-dashboard")}
            className="text-sm text-gray-400 hover:text-gray-700 transition mb-3 flex items-center gap-1"
          >
            ← Back to dashboard
          </button>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">List a new property</h1>
          <p className="text-sm text-gray-400 mt-1">Fill in the details below — takes about 2 minutes.</p>
        </div>
      </div>

      {/* ── Form ── */}

      <form onSubmit={handleSubmit} className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-8">

        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">


          <Section title="Basic information" subtitle="Tell guests about your space">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {FIELDS.map((f) => (
                <div key={f.name} className={f.span === 2 ? "sm:col-span-2" : ""}>
                  <Field
                    label={f.label}
                    name={f.name}
                    type={f.type}
                    placeholder={f.placeholder}
                    value={form[f.name]}
                    onChange={handleChange}
                    error={errors[f.name]}
                  />
                </div>
              ))}
            </div>
          </Section>

          
          <div className="space-y-8">


            <Section title="Description" subtitle="What makes your place special?">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Description <span className="text-[#FF385C]">*</span>
              </label>
              <textarea
                name="description"
                rows={4}
                value={form.description}
                onChange={handleChange}
                placeholder="Describe your space — location highlights, amenities, vibe…"
                className={`w-full rounded-xl border px-4 py-3 text-sm text-gray-800 placeholder-gray-300 resize-none focus:outline-none focus:ring-2 focus:ring-[#FF385C] focus:border-transparent transition ${errors.description ? "border-red-300 bg-red-50" : "border-gray-200 bg-white"
                  }`}
              />
              {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description}</p>}
            </Section>

            
            <Section title="House rules" subtitle="Optional — e.g. no pets, no smoking">
              <textarea
                name="rules"
                rows={2}
                value={form.rules}
                onChange={handleChange}
                placeholder="e.g. No smoking, quiet hours after 10 PM…"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-800 placeholder-gray-300 resize-none focus:outline-none focus:ring-2 focus:ring-[#FF385C] focus:border-transparent transition bg-white"
              />
            </Section>

          </div>
        </div>

        
        <Section
          title="Photos"
          subtitle={`Add up to ${MAX_PHOTOS} photos. First photo will be the cover.`}
        >
          {/* Drop zone */}
          {photos.length < MAX_PHOTOS && (
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => { e.preventDefault(); setDragOver(false); addFiles(e.dataTransfer.files); }}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl px-6 py-10 text-center cursor-pointer transition-all ${dragOver
                ? "border-[#FF385C] bg-rose-50"
                : errors.photos
                  ? "border-red-300 bg-red-50"
                  : "border-gray-200 bg-white hover:border-[#FF385C] hover:bg-rose-50"
                }`}
            >
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center border border-rose-100">
                  <svg className="w-6 h-6 text-[#FF385C]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-sm font-semibold text-gray-700">
                  Drop photos here or <span className="text-[#FF385C]">browse</span>
                </p>
                <p className="text-xs text-gray-400">
                  JPG, PNG, WEBP · {MAX_PHOTOS - photos.length} slot{MAX_PHOTOS - photos.length !== 1 ? "s" : ""} remaining
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => addFiles(e.target.files)}
              />
            </div>
          )}

          {errors.photos && (
            <p className="text-xs text-red-500 mt-2">{errors.photos}</p>
          )}

          {/* Preview grid */}
          {previews.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 mt-4">
              {previews.map((src, i) => (
                <div key={src} className="relative group rounded-xl overflow-hidden aspect-square bg-gray-100">
                  <img src={src} alt={`photo ${i + 1}`} className="w-full h-full object-cover" />

                  {/* Cover badge */}
                  {i === 0 && (
                    <span className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-sm text-xs font-semibold text-gray-700 px-2 py-0.5 rounded-full shadow-sm">
                      Cover
                    </span>
                  )}

                  {/* Photo number */}
                  <span className="absolute top-2 left-2 bg-black/40 text-white text-xs font-medium w-5 h-5 rounded-full flex items-center justify-center">
                    {i + 1}
                  </span>

                  {/* Remove button */}
                  <button
                    type="button"
                    onClick={() => removePhoto(i)}
                    className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition hover:bg-red-50"
                  >
                    <svg className="w-3.5 h-3.5 text-gray-600 hover:text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}

              {/* Add more slot */}
              {photos.length < MAX_PHOTOS && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-square rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-1 hover:border-[#FF385C] hover:bg-rose-50 transition cursor-pointer"
                >
                  <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span className="text-xs text-gray-400">Add more</span>
                </button>
              )}
            </div>
          )}

          {/* Counter */}
          {photos.length > 0 && (
            <p className="text-xs text-gray-400 mt-2 text-right">
              {photos.length} / {MAX_PHOTOS} photos added
            </p>
          )}
        </Section>

        {/* ── Submit error ── */}
        {errors.submit && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl px-5 py-4 text-sm font-medium">
            {errors.submit}
          </div>
        )}

        {/* ── Actions ── */}
        <div className="flex items-center justify-between pt-2 pb-12">
          <button
            type="button"
            onClick={() => navigate("/host-dashboard")}
            className="text-sm font-medium text-gray-500 hover:text-gray-800 transition px-5 py-3 rounded-full hover:bg-gray-100"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-2 bg-[#FF385C] hover:bg-[#e0314f] text-white text-sm font-semibold px-8 py-3 rounded-full transition-all shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Listing…
              </>
            ) : (
              "List property →"
            )}
          </button>
        </div>

      </form>
    </div>
  );
}

/* ── Section wrapper ── */
function Section({ title, subtitle, children }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-50">
        <h2 className="text-base font-semibold text-gray-900">{title}</h2>
        {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
      <div className="px-6 py-5">{children}</div>
    </div>
  );
}

function Field({ label, name, type, placeholder, value, onChange, error }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label} <span className="text-[#FF385C]">*</span>
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        min={type === "number" ? 1 : undefined}
        className={`w-full rounded-xl border px-4 py-3 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#FF385C] focus:border-transparent transition ${error ? "border-red-300 bg-red-50" : "border-gray-200 bg-white"
          }`}
      />
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}