import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { loginSchema, insertGroupSchema, insertStudentSchema, insertAttendanceSchema, insertMedalSchema, insertProductSchema, insertPurchaseSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = loginSchema.parse(req.body);
      
      const user = await storage.getUserByEmail(email);
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // In a real app, you'd use proper session management
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
      
      // Get user data for each student
      const studentsWithUsers = await Promise.all(
        students.map(async (student) => {
          const user = await storage.getUser(student.userId);
          const group = student.groupId ? await storage.getGroup(student.groupId) : null;
          return {
            ...student,
            user,
            group,
          };
        })
      );
      
      res.json(studentsWithUsers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch students" });
    }
  });

  app.get("/api/students/current", async (req, res) => {
    try {
      const { userId } = req.query;
      if (!userId) {
        return res.status(400).json({ message: "User ID required" });
      }
      
      const student = await storage.getStudentByUserId(userId as string);
      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }

      const user = await storage.getUser(student.userId);
      const group = student.groupId ? await storage.getGroup(student.groupId) : null;
      
      res.json({
        ...student,
        user,
        group,
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch student data" });
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

  // Attendance routes
  app.get("/api/attendance", async (req, res) => {
    try {
      const { studentId, groupId } = req.query;
      
      let attendance;
      if (studentId) {
        attendance = await storage.getAttendanceByStudent(studentId as string);
      } else if (groupId) {
        attendance = await storage.getAttendanceByGroup(groupId as string);
      } else {
        attendance = await storage.getAttendance();
      }
      
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

  // Medals routes
  app.get("/api/medals", async (req, res) => {
    try {
      const { studentId } = req.query;
      
      let medals;
      if (studentId) {
        medals = await storage.getMedalsByStudent(studentId as string);
      } else {
        medals = await storage.getMedals();
      }
      
      // Get student and user data for each medal
      const medalsWithData = await Promise.all(
        medals.map(async (medal) => {
          const student = await storage.getStudent(medal.studentId);
          const user = student ? await storage.getUser(student.userId) : null;
          const awardedBy = await storage.getUser(medal.awardedBy);
          return {
            ...medal,
            student,
            user,
            awardedBy,
          };
        })
      );
      
      res.json(medalsWithData);
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

  app.delete("/api/medals/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteMedal(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Medal not found" });
      }
      
      res.json({ message: "Medal revoked successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to revoke medal" });
    }
  });

  // Products routes
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

  app.put("/api/products/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updates = insertProductSchema.partial().parse(req.body);
      const product = await storage.updateProduct(id, updates);
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      res.json(product);
    } catch (error) {
      res.status(400).json({ message: "Invalid update data" });
    }
  });

  app.delete("/api/products/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteProduct(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      res.json({ message: "Product deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete product" });
    }
  });

  // Purchases routes
  app.get("/api/purchases", async (req, res) => {
    try {
      const { studentId } = req.query;
      
      let purchases;
      if (studentId) {
        purchases = await storage.getPurchasesByStudent(studentId as string);
      } else {
        purchases = await storage.getPurchases();
      }
      
      res.json(purchases);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch purchases" });
    }
  });

  app.post("/api/purchases", async (req, res) => {
    try {
      const purchaseData = insertPurchaseSchema.parse(req.body);
      
      // Validate student has enough medals
      const student = await storage.getStudent(purchaseData.studentId);
      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }

      const hasEnoughMedals = 
        (student.goldMedals || 0) >= (purchaseData.goldSpent || 0) &&
        (student.silverMedals || 0) >= (purchaseData.silverSpent || 0) &&
        (student.bronzeMedals || 0) >= (purchaseData.bronzeSpent || 0);

      if (!hasEnoughMedals) {
        return res.status(400).json({ message: "Insufficient medals" });
      }

      const purchase = await storage.createPurchase(purchaseData);
      res.status(201).json(purchase);
    } catch (error) {
      res.status(400).json({ message: "Invalid purchase data" });
    }
  });

  // Dashboard stats
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const groups = await storage.getGroups();
      const students = await storage.getStudents();
      const medals = await storage.getMedals();
      const attendance = await storage.getAttendance();

      const totalPresent = attendance.filter(a => a.status === 'present').length;
      const attendanceRate = attendance.length > 0 ? Math.round((totalPresent / attendance.length) * 100) : 0;

      res.json({
        totalGroups: groups.length,
        totalStudents: students.length,
        medalsAwarded: medals.length,
        attendanceRate: `${attendanceRate}%`,
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
