onRecordBeforeCreateRequest((e) => {
  // Username yoksa email'den oluştur
  if (!e.record.get("username")) {
    const email = e.record.get("email");
    if (email) {
      e.record.set("username", email.split("@")[0].toLowerCase());
    }
  }
  
  // Unique referral kodu oluştur
  if (!e.record.get("referral_code")) {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    e.record.set("referral_code", code);
  }
  
  // Default değerler
  e.record.set("role", e.record.get("role") || "user");
  e.record.set("language", e.record.get("language") || "tr");
  e.record.set("is_active", e.record.get("is_active") !== false);
  
  // Counter field'ları initialize et
  if (e.record.get("followers_count") === null) e.record.set("followers_count", 0);
  if (e.record.get("following_count") === null) e.record.set("following_count", 0);
  if (e.record.get("catches_count") === null) e.record.set("catches_count", 0);
  if (e.record.get("spots_count") === null) e.record.set("spots_count", 0);
  if (e.record.get("referral_count") === null) e.record.set("referral_count", 0);
  
  // Timestamp'ler
  const now = new Date().toISOString();
  if (!e.record.get("created_at")) e.record.set("created_at", now);
  e.record.set("updated_at", now);
  
  e.next();
}, "users");

// User update edildiğinde updated_at güncelle
onRecordBeforeUpdateRequest((e) => {
  e.record.set("updated_at", new Date().toISOString());
  e.next();
}, "users");
