
import { Translations } from './types';

// ROOMS and TOTAL_ROOMS are now fetched from the API and managed in AppContext.

export const translations: Translations = {
    // General
    "sunriver_hotel": { en: "Sunriver Hotel", th: "โรงแรมซันริเวอร์" },
    "management_system": { en: "Management System", th: "ระบบจัดการ" },
    "login": { en: "Login", th: "เข้าสู่ระบบ" },
    "username": { en: "Username", th: "ชื่อผู้ใช้" },
    "password": { en: "Password", th: "รหัสผ่าน" },
    "invalid_credentials": { en: "Invalid username or password", th: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" },
    "logout": { en: "Logout", th: "ออกจากระบบ" },
    "confirm": { en: "Confirm", th: "ยืนยัน" },
    "cancel": { en: "Cancel", th: "ยกเลิก" },
    "close": { en: "Close", th: "ปิด" },
    "upload_new_logo": { en: "Upload New Logo", th: "อัปโหลดโลโก้ใหม่" },

    // Navigation
    "home": { en: "Home", th: "ภาพรวมการจอง" },
    "room_status": { en: "Room Status", th: "สถานะห้องพัก" },
    "dashboard": { en: "Dashboard", th: "แดชบอร์ด" },
    "cleaning": { en: "Cleaning", th: "สถานะทำความสะอาด" },
    "receipt": { en: "Receipt", th: "ใบเสร็จ" },

    // Home Page
    "booking_overview": { en: "Booking Overview", th: "ภาพรวมการจอง" },
    "add_booking": { en: "Add Booking", th: "เพิ่มการจอง" },
    "available": { en: "Available", th: "ห้องว่าง" },
    "booked": { en: "Booked", th: "จองแล้ว" },
    "vacant": { en: "Vacant", th: "ว่าง" },
    "fully_booked": { en: "Fully Booked", th: "ห้องพักเต็ม" },
    "todays_overview": { en: "Today's Overview", th: "ภาพรวมวันนี้" },
    "check_ins": { en: "Check-ins", th: "เช็คอิน" },
    "check_outs": { en: "Check-outs", th: "เช็คเอาท์" },
    "in_house": { en: "In-House", th: "กำลังเข้าพัก" },
    "no_check_ins": { en: "No check-ins today.", th: "ไม่มีการเช็คอินวันนี้" },
    "no_check_outs": { en: "No check-outs today.", th: "ไม่มีการเช็คเอาท์วันนี้" },
    "no_in_house": { en: "No in-house guests.", th: "ไม่มีแขกกำลังเข้าพัก" },
    
    // Booking Form
    "new_booking": { en: "New Booking", th: "การจองใหม่" },
    "edit_booking": { en: "Edit Booking", th: "แก้ไขการจอง" },
    "customer_name": { en: "Customer Name", th: "ชื่อลูกค้า" },
    "phone": { en: "Phone", th: "เบอร์โทรศัพท์" },
    "check_in_date": { en: "Check-in Date", th: "วันที่เช็คอิน" },
    "check_out_date": { en: "Check-out Date", th: "วันที่เช็คเอาท์" },
    "room": { en: "Room", th: "ห้อง" },
    "select_room": { en: "Select a room", th: "เลือกห้อง" },
    "payment_status": { en: "Payment Status", th: "สถานะการชำระเงิน" },
    "unpaid": { en: "Unpaid", th: "ยังไม่ชำระ" },
    "deposit": { en: "Deposit", th: "มัดจำ" },
    "paid": { en: "Paid", th: "ชำระแล้ว" },
    "deposit_amount": { en: "Deposit Amount", th: "จำนวนเงินมัดจำ" },
    "price_per_night": { en: "Price per night", th: "ราคาต่อคืน" },
    "email_optional": { en: "Email (optional)", th: "อีเมล (ไม่บังคับ)" },
    "address_optional": { en: "Address (optional)", th: "ที่อยู่ (ไม่บังคับ)" },
    "tax_id_optional": { en: "Tax ID (optional)", th: "เลขผู้เสียภาษี (ไม่บังคับ)" },
    "save_booking": { en: "Save Booking", th: "บันทึกการจอง" },
    "booking_id": { en: "Booking ID", th: "รหัสการจอง" },
    "booking_date": { en: "Booking Date", th: "วันที่จอง" },
    "nights": {en: "nights", th: "คืน"},
    "booking_period": { en: "Booking Period", th: "ระยะเวลาการจอง" },

    // Room Status Page
    "view_date": { en: "View Date", th: "ดูวันที่" },
    "sort_by": { en: "Sort By", th: "เรียงตาม" },
    "room_number": { en: "Room Number", th: "เลขห้อง" },
    "room_type": { en: "Room Type", th: "ประเภทห้อง" },
    "bed_type": { en: "Bed Type", th: "ประเภทเตียง" },
    "occupied": { en: "Occupied", th: "ไม่ว่าง" },
    
    // Dashboard Page
    "occupancy_statistics": { en: "Occupancy Statistics", th: "สถิติการเข้าพัก" },
    "daily": { en: "Daily", th: "รายวัน" },
    "monthly": { en: "Monthly", th: "รายเดือน" },
    "yearly": { en: "Yearly", th: "รายปี" },
    "occupied_rooms": { en: "Occupied Rooms", th: "จำนวนห้องที่ถูกจอง" },
    "rooms_unit": { en: "rooms", th: "ห้อง" },
    "popular_rooms": { en: "Popular Rooms", th: "ห้องพักยอดนิยม" },
    "number_of_bookings": { en: "Number of Bookings", th: "จำนวนการจอง" },
    "all_types": { en: "All Types", th: "ทุกประเภท" },

    // Cleaning Page
    "cleaning_status_for": { en: "Cleaning Status for", th: "สถานะการทำความสะอาดสำหรับวันที่" },
    "clean": { en: "Clean", th: "ทำความสะอาดแล้ว" },
    "dirty": { en: "Dirty", th: "ยังไม่ได้ทำความสะอาด" },
    "confirm_status_change": { en: "Confirm Status Change", th: "ยืนยันการเปลี่ยนสถานะ" },
    "confirm_clean_message": { en: "Are you sure you want to mark this room as CLEAN?", th: "คุณแน่ใจหรือไม่ว่าต้องการเปลี่ยนสถานะห้องนี้เป็น ทำความสะอาดแล้ว?" },
    "confirm_dirty_message": { en: "Are you sure you want to mark this room as DIRTY?", th: "คุณแน่ใจหรือไม่ว่าต้องการเปลี่ยนสถานะห้องนี้เป็น ยังไม่ได้ทำความสะอาด?" },
    "status_check_in": {en: "Check-in today", th: "จะเช็คอินวันนี้"},
    "status_in_house": {en: "In-house guest", th: "กำลังเข้าพัก"},
    "status_check_out": {en: "Check-out today", th: "จะเช็คเอาท์วันนี้"},
    "status_vacant": {en: "Vacant", th: "ว่าง"},

    // Receipt Page
    "generate_receipt": { en: "Generate Receipt", th: "ออกใบเสร็จ" },
    "search_bookings": { en: "Search by Name, Phone, Check-in, Booking ID...", th: "ค้นหาจากชื่อ, เบอร์โทร, วันเช็คอิน, รหัสการจอง..." },
    "recent_bookings": { en: "Recent Bookings", th: "การจองล่าสุด" },
    "select_bookings_to_combine": { en: "Select one or more bookings to generate a combined receipt.", th: "เลือกการจองหนึ่งรายการขึ้นไปเพื่อออกใบเสร็จรวม" },
    "no_bookings_found": { en: "No bookings found.", th: "ไม่พบการจอง" },
    "receipt_document_title": { en: "RECEIPT", th: "ใบเสร็จรับเงิน" },
    "receipt_no": { en: "Receipt No.", th: "เลขที่ใบเสร็จ" },
    "date": { en: "Date", th: "วันที่" },
    "customer_info": { en: "Customer Information", th: "ข้อมูลลูกค้า" },
    "description": { en: "Description", th: "รายการ" },
    "no_of_nights": { en: "No. of Nights", th: "จำนวนคืน" },
    "unit_price": { en: "Unit Price", th: "ราคาต่อหน่วย" },
    "total": { en: "Total", th: "รวม" },
    "total_amount": { en: "Total Amount", th: "รวมเงินทั้งหมด" },
    "authorized_signature": { en: "Authorized Signature", th: "ผู้มีอำนาจลงนาม" },
    "print_receipt": { en: "Print Receipt", th: "พิมพ์ใบเสร็จ" },

    // Receipt Enhancement
    "payment_information": { en: "Payment Information", th: "ข้อมูลการชำระเงิน" },
    "remarks": { en: "Remarks", th: "หมายเหตุ" },
    "cash": { en: "Cash", th: "เงินสด" },
    "transfer": { en: "Transfer", th: "เงินโอน" },
    "amount": { en: "Amount", th: "จำนวนเงิน" },
    "thb": { en: "THB", th: "บาท" },
    "no_of_rooms": { en: "No. of rooms", th: "จำนวนห้องพัก" },
    
    // Room Type descriptions for receipt
    "river_sunrise_room": { en: "River Sunrise Room", th: "ห้องพัก ริเวอร์ ซันไรส์" },
    "standard_twin_room": { en: "Standard Twin Room", th: "ห้องพัก สแตนดาร์ด ทวิน" },
    "standard_double_room": { en: "Standard Double Room", th: "ห้องพัก สแตนดาร์ด ดับเบิล" },
    "cottage_room": { en: "Cottage Room", th: "ห้องพัก บ้านไม้" },
};
