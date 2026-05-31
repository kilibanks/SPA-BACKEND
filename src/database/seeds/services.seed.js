const { pool } = require("../../config/db");

const seedServices = async () => {
  try {
    const [existingServices] = await pool.query("SELECT COUNT(*) as count FROM services");
    
    if (existingServices[0].count > 0) {
      console.log("Services already exist, skipping seed");
      return;
    }

    // Create categories if they don't exist
    const [existingCategories] = await pool.query("SELECT COUNT(*) as count FROM service_categories");
    
    if (existingCategories[0].count === 0) {
      await pool.query(
        "INSERT INTO service_categories (name, description) VALUES (?, ?), (?, ?), (?, ?)",
        ["Massage", "Full-body and targeted massage therapies", "Facials", "Deep cleansing and rejuvenating facial treatments", "Nails", "Manicure, pedicure and nail art services"]
      );
      console.log("✅ Service categories seeded");
    }

    // Get category IDs
    const [categories] = await pool.query("SELECT category_id, name FROM service_categories");
    const categoryMap = {};
    categories.forEach(cat => {
      categoryMap[cat.name] = cat.category_id;
    });

    const services = [
      {
        title: "Swedish Massage",
        service_name: "Swedish Massage",
        description: "Relaxing full-body massage",
        price: 80.00,
        duration_minutes: 60,
        status: "Available",
        category: "Massage",
        images: ["https://images.unsplash.com/photo-1544161515-81aae3ff8d47", "https://images.unsplash.com/photo-1596178065887-ba9ecffd5bf3", "https://images.unsplash.com/photo-1600334129128-685c5582fd35", "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d"]
      },
      {
        title: "Facial Treatment",
        service_name: "Facial Treatment",
        description: "Deep cleansing facial treatment",
        price: 65.00,
        duration_minutes: 45,
        status: "Available",
        category: "Facials",
        images: ["https://images.unsplash.com/photo-1487412720507-e7ab37603c6f", "https://images.unsplash.com/photo-1524504388940-b1c1722653e1", "https://images.unsplash.com/photo-1494790108377-be9c29b29330", "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e"]
      },
      {
        title: "Manicure",
        service_name: "Manicure",
        description: "Nail shaping, cuticle care and polish application for neat elegant hands",
        price: 30.00,
        duration_minutes: 30,
        status: "Available",
        category: "Nails",
        images: ["https://images.unsplash.com/photo-1604654894610-df63bc536371", "https://images.unsplash.com/photo-1604654894610-df63bc536371", "https://images.unsplash.com/photo-1607623814075-e51df1bdc82f", "https://images.unsplash.com/photo-1604654894610-df63bc536371"]
      },
      {
        title: "Pedicure",
        service_name: "Pedicure",
        description: "Relaxing foot treatment including soaking, scrubbing and massage",
        price: 40.00,
        duration_minutes: 45,
        status: "Available",
        category: "Nails",
        images: ["https://images.unsplash.com/photo-1604654894610-df63bc536371", "https://images.unsplash.com/photo-1607623814075-e51df1bdc82f", "https://images.unsplash.com/photo-1604654894610-df63bc536371", "https://images.unsplash.com/photo-1607623814075-e51df1bdc82f", "https://images.unsplash.com/photo-1604654894610-df63bc536371"]
      },
      {
        title: "Glow Facial",
        service_name: "Glow Facial",
        description: "Deep cleansing facial treatment for glowing healthy skin",
        price: 50.00,
        duration_minutes: 60,
        status: "Available",
        category: "Facials",
        images: ["https://images.unsplash.com/photo-1515377905703-c4788e51af15", "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f", "https://images.unsplash.com/photo-1524504388940-b1c1722653e1", "https://images.unsplash.com/photo-1494790108377-be9c29b29330", "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e"]
      }
    ];

    // Insert services and get their IDs
    for (const service of services) {
      const [result] = await pool.query(
        "INSERT INTO services (title, service_name, description, price, duration_minutes, status, category_id) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [
          service.title,
          service.service_name,
          service.description,
          service.price,
          service.duration_minutes,
          service.status,
          categoryMap[service.category] || null
        ]
      );
      
      // Insert images for this service
      const serviceId = result.insertId;
      for (let i = 0; i < service.images.length; i++) {
        await pool.query(
          "INSERT INTO service_images (service_id, image_url, is_primary) VALUES (?, ?, ?)",
          [serviceId, service.images[i], i === 0]
        );
      }
    }

    console.log("✅ Services seeded successfully");
  } catch (error) {
    console.error("❌ Error seeding services:", error.message);
  }
};

module.exports = { seedServices };
