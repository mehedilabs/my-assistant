export function getAssistantReply(message: string): string {
  const text = message.toLowerCase().trim();

  if (
    text.includes("hello") ||
    text.includes("হ্যালো") ||
    text.includes("হাই")
  ) {
    return "হ্যালো! আমি JARVIS, তোমার ব্যক্তিগত সহকারী। কীভাবে সাহায্য করতে পারি?";
  }

  if (text.includes("সময়") || text.includes("time")) {
    return "এখনকার সঠিক সময় জানার সুবিধাটি পরে যুক্ত করব।";
  }

  if (text.includes("youtube") || text.includes("ইউটিউব")) {
    return "YouTube সার্চের সুবিধাটি Backend যুক্ত করার পর চালু করব।";
  }

  if (
    text.includes("মনে কর") ||
    text.includes("reminder") ||
    text.includes("রিমাইন্ডার")
  ) {
    return "রিমাইন্ডারের ইন্টারফেস তৈরি হচ্ছে। পরে রিমাইন্ডার সংরক্ষণ ও নোটিফিকেশন যুক্ত করব।";
  }

  return `তোমার মেসেজটি পেয়েছি: “${message}”। আপাতত আমি পরীক্ষামূলক মোডে আছি। আসল AI উত্তর দেওয়ার সুবিধাটি পরে যুক্ত হবে।`;
}
