import type { VercelRequest, VercelResponse } from '@vercel/node';
import express, { type Request, Response, NextFunction } from "express";
import { storage } from "../server/storage";
import { loginSchema, insertGroupSchema, insertStudentSchema, insertAttendanceSchema, insertMedalSchema, insertProductSchema, insertPurchaseSchema } from "../shared/schema";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Authentication routes
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = loginSchema.parse(req.body);
    
    const user = await storage.getUserByEmail(email);
    if (!user || user.password !== password) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    res.json({ 
      user: { 
        id: user.id, 
        email: user.email, 
        role: user.role, 
        name: user.name 
      } 
    });
  } catch (error) {
    res.status(400).json({ message: "Invalid request data" });
  }
});

app.post("/api/auth/logout", (req, res) => {
  res.json({ message: "Logged out successfully" });
});

// Groups routes
app.get("/api/groups", async (req, res) => {
  try {
    const groups = await storage.getGroups();
    res.json(groups);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch groups" });
  }
});

app.post("/api/groups", async (req, res) => {
  try {
    const groupData = insertGroupSchema.parse(req.body);
    const group = await storage.createGroup(groupData);
    res.status(201).json(group);
  } catch (error) {
    res.status(400).json({ message: "Invalid group data" });
  }
});

app.put("/api/groups/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updates = insertGroupSchema.partial().parse(req.body);
    const group = await storage.updateGroup(id, updates);
    
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }
    
    res.json(group);
  } catch (error) {
    res.status(400).json({ message: "Invalid update data" });
  }
});

app.delete("/api/groups/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await storage.deleteGroup(id);
    
    if (!deleted) {
      return res.status(404).json({ message: "Group not found" });
    }
    
    res.json({ message: "Group deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete group" });
  }
});

// Students routes
app.get("/api/students", async (req, res) => {
  try {
    const students = await storage.getStudents();
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch students" });
  }
});

app.post("/api/students", async (req, res) => {
  try {
    const studentData = insertStudentSchema.parse(req.body);
    const student = await storage.createStudent(studentData);
    res.status(201).json(student);
  } catch (error) {
    res.status(400).json({ message: "Invalid student data" });
  }
});

app.put("/api/students/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updates = insertStudentSchema.partial().parse(req.body);
    const student = await storage.updateStudent(id, updates);
    
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }
    
    res.json(student);
  } catch (error) {
    res.status(400).json({ message: "Invalid update data" });
  }
});

app.delete("/api/students/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await storage.deleteStudent(id);
    
    if (!deleted) {
      return res.status(404).json({ message: "Student not found" });
    }
    
    res.json({ message: "Student deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete student" });
  }
});

// Other routes (attendance, medals, products, purchases)
app.get("/api/attendance", async (req, res) => {
  try {
    const attendance = await storage.getAttendance();
    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch attendance" });
  }
});

app.post("/api/attendance", async (req, res) => {
  try {
    const attendanceData = insertAttendanceSchema.parse(req.body);
    const attendance = await storage.createAttendance(attendanceData);
    res.status(201).json(attendance);
  } catch (error) {
    res.status(400).json({ message: "Invalid attendance data" });
  }
});

app.get("/api/medals", async (req, res) => {
  try {
    const medals = await storage.getMedals();
    res.json(medals);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch medals" });
  }
});

app.post("/api/medals", async (req, res) => {
  try {
    const medalData = insertMedalSchema.parse(req.body);
    const medal = await storage.createMedal(medalData);
    res.status(201).json(medal);
  } catch (error) {
    res.status(400).json({ message: "Invalid medal data" });
  }
});

app.get("/api/products", async (req, res) => {
  try {
    const products = await storage.getProducts();
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch products" });
  }
});

app.post("/api/products", async (req, res) => {
  try {
    const productData = insertProductSchema.parse(req.body);
    const product = await storage.createProduct(productData);
    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ message: "Invalid product data" });
  }
});

app.get("/api/purchases", async (req, res) => {
  try {
    const purchases = await storage.getPurchases();
    res.json(purchases);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch purchases" });
  }
});

app.post("/api/purchases", async (req, res) => {
  try {
    const purchaseData = insertPurchaseSchema.parse(req.body);
    const purchase = await storage.createPurchase(purchaseData);
    res.status(201).json(purchase);
  } catch (error) {
    res.status(400).json({ message: "Invalid purchase data" });
  }
});

// Dashboard stats
app.get("/api/dashboard/stats", async (req, res) => {
  try {
    const [groups, students, attendance, medals] = await Promise.all([
      storage.getGroups(),
      storage.getStudents(),
      storage.getAttendance(),
      storage.getMedals()
    ]);

    const stats = {
      totalGroups: groups.length,
      totalStudents: students.length,
      totalAttendance: attendance.length,
      totalMedals: medals.length,
      activeStudents: students.filter(s => s.status === 'active').length,
    };

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch dashboard stats" });
  }
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  return new Promise((resolve, reject) => {
    app(req as any, res as any, (err: any) => {
      if (err) {
        reject(err);
      } else {
        resolve(undefined);
      }
    });
  });
}