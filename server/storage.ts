import { type User, type InsertUser, type Group, type InsertGroup, type Student, type InsertStudent, type Attendance, type InsertAttendance, type Medal, type InsertMedal, type Product, type InsertProduct, type Purchase, type InsertPurchase } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Groups
  getGroups(): Promise<Group[]>;
  getGroup(id: string): Promise<Group | undefined>;
  createGroup(group: InsertGroup): Promise<Group>;
  updateGroup(id: string, group: Partial<InsertGroup>): Promise<Group | undefined>;
  deleteGroup(id: string): Promise<boolean>;

  // Students
  getStudents(): Promise<Student[]>;
  getStudent(id: string): Promise<Student | undefined>;
  getStudentByUserId(userId: string): Promise<Student | undefined>;
  getStudentByStudentId(studentId: string): Promise<Student | undefined>;
  createStudent(student: InsertStudent): Promise<Student>;
  updateStudent(id: string, student: Partial<InsertStudent>): Promise<Student | undefined>;
  deleteStudent(id: string): Promise<boolean>;

  // Attendance
  getAttendance(): Promise<Attendance[]>;
  getAttendanceByStudent(studentId: string): Promise<Attendance[]>;
  getAttendanceByGroup(groupId: string): Promise<Attendance[]>;
  createAttendance(attendance: InsertAttendance): Promise<Attendance>;
  updateAttendance(id: string, attendance: Partial<InsertAttendance>): Promise<Attendance | undefined>;

  // Medals
  getMedals(): Promise<Medal[]>;
  getMedalsByStudent(studentId: string): Promise<Medal[]>;
  createMedal(medal: InsertMedal): Promise<Medal>;
  deleteMedal(id: string): Promise<boolean>;

  // Products
  getProducts(): Promise<Product[]>;
  getProduct(id: string): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: string): Promise<boolean>;

  // Purchases
  getPurchases(): Promise<Purchase[]>;
  getPurchasesByStudent(studentId: string): Promise<Purchase[]>;
  createPurchase(purchase: InsertPurchase): Promise<Purchase>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private groups: Map<string, Group> = new Map();
  private students: Map<string, Student> = new Map();
  private attendance: Map<string, Attendance> = new Map();
  private medals: Map<string, Medal> = new Map();
  private products: Map<string, Product> = new Map();
  private purchases: Map<string, Purchase> = new Map();

  constructor() {
    this.initializeData();
  }

  private initializeData() {
    // Create admin user
    const adminId = randomUUID();
    this.users.set(adminId, {
      id: adminId,
      email: "admin@mail.com",
      password: "admin123",
      role: "admin",
      name: "Admin User",
      createdAt: new Date(),
    });

    // Create student user
    const studentUserId = randomUUID();
    this.users.set(studentUserId, {
      id: studentUserId,
      email: "student@mail.com", 
      password: "student123",
      role: "student",
      name: "Student User",
      createdAt: new Date(),
    });

    // Create sample group
    const groupId = randomUUID();
    this.groups.set(groupId, {
      id: groupId,
      name: "React Fundamentals",
      description: "Frontend Development",
      schedule: "Mon, Wed, Fri - 10:00 AM",
      capacity: 30,
      status: "active",
      createdAt: new Date(),
    });

    // Create student record
    const studentId = randomUUID();
    this.students.set(studentId, {
      id: studentId,
      userId: studentUserId,
      studentId: "TIT-2024-001",
      groupId: groupId,
      goldMedals: 3,
      silverMedals: 5,
      bronzeMedals: 8,
      status: "active", // ✅ YANGI QATOR
      createdAt: new Date(),
    });

    // Add sample products
    const products = [
      {
        id: randomUUID(),
        name: "MacBook Pro",
        description: "High-performance laptop for development",
        image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250",
        goldPrice: 50,
        silverPrice: 0,
        bronzePrice: 0,
        inStock: true,
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        name: "Wireless Mouse & Keyboard",
        description: "Premium wireless peripherals set",
        image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250",
        goldPrice: 0,
        silverPrice: 15,
        bronzePrice: 0,
        inStock: true,
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        name: "Programming Books Set",
        description: "Essential programming literature collection",
        image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250",
        goldPrice: 0,
        silverPrice: 0,
        bronzePrice: 8,
        inStock: true,
        createdAt: new Date(),
      }
    ];

    products.forEach(product => this.products.set(product.id, product));
  }

  // Users
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser, 
      id,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  // Groups
  async getGroups(): Promise<Group[]> {
    return Array.from(this.groups.values());
  }

  async getGroup(id: string): Promise<Group | undefined> {
    return this.groups.get(id);
  }

  async createGroup(insertGroup: InsertGroup): Promise<Group> {
    const id = randomUUID();
    const group: Group = { 
      id,
      createdAt: new Date(),
      name: insertGroup.name,
      status: insertGroup.status ?? null, // ✅ TUZATILGAN
      description: insertGroup.description ?? null, // ✅ TUZATILGAN
      schedule: insertGroup.schedule ?? null, // ✅ TUZATILGAN
      capacity: insertGroup.capacity ?? null, // ✅ TUZATILGAN
    };
    this.groups.set(id, group);
    return group;
  }

  async updateGroup(id: string, updates: Partial<InsertGroup>): Promise<Group | undefined> {
    const group = this.groups.get(id);
    if (!group) return undefined;
    
    const updatedGroup = { ...group, ...updates };
    this.groups.set(id, updatedGroup);
    return updatedGroup;
  }

  async deleteGroup(id: string): Promise<boolean> {
    return this.groups.delete(id);
  }

  // Students
  async getStudents(): Promise<Student[]> {
    return Array.from(this.students.values());
  }

  async getStudent(id: string): Promise<Student | undefined> {
    return this.students.get(id);
  }

  async getStudentByUserId(userId: string): Promise<Student | undefined> {
    return Array.from(this.students.values()).find(student => student.userId === userId);
  }

  async getStudentByStudentId(studentId: string): Promise<Student | undefined> {
    return Array.from(this.students.values()).find(student => student.studentId === studentId);
  }

  async createStudent(insertStudent: InsertStudent): Promise<Student> {
    const id = randomUUID();
    const student: Student = { 
      id,
      createdAt: new Date(),
      userId: insertStudent.userId,
      studentId: insertStudent.studentId,
      groupId: insertStudent.groupId ?? null, // ✅ TUZATILGAN
      goldMedals: insertStudent.goldMedals ?? null, // ✅ TUZATILGAN
      silverMedals: insertStudent.silverMedals ?? null, // ✅ TUZATILGAN
      bronzeMedals: insertStudent.bronzeMedals ?? null, // ✅ TUZATILGAN
      status: insertStudent.status ?? null, // ✅ QO'SHILGAN
    };
    this.students.set(id, student);
    return student;
  }

  async updateStudent(id: string, updates: Partial<InsertStudent>): Promise<Student | undefined> {
    const student = this.students.get(id);
    if (!student) return undefined;
    
    const updatedStudent = { ...student, ...updates };
    this.students.set(id, updatedStudent);
    return updatedStudent;
  }

  async deleteStudent(id: string): Promise<boolean> {
    return this.students.delete(id);
  }

  // Attendance
  async getAttendance(): Promise<Attendance[]> {
    return Array.from(this.attendance.values());
  }

  async getAttendanceByStudent(studentId: string): Promise<Attendance[]> {
    return Array.from(this.attendance.values()).filter(att => att.studentId === studentId);
  }

  async getAttendanceByGroup(groupId: string): Promise<Attendance[]> {
    return Array.from(this.attendance.values()).filter(att => att.groupId === groupId);
  }

  async createAttendance(insertAttendance: InsertAttendance): Promise<Attendance> {
    const id = randomUUID();
    const attendance: Attendance = { 
      id,
      createdAt: new Date(),
      status: insertAttendance.status,
      date: insertAttendance.date,
      studentId: insertAttendance.studentId,
      groupId: insertAttendance.groupId,
      notes: insertAttendance.notes ?? null, // ✅ TUZATILGAN
    };
    this.attendance.set(id, attendance);
    return attendance;
  }

  async updateAttendance(id: string, updates: Partial<InsertAttendance>): Promise<Attendance | undefined> {
    const attendance = this.attendance.get(id);
    if (!attendance) return undefined;
    
    const updatedAttendance = { ...attendance, ...updates };
    this.attendance.set(id, updatedAttendance);
    return updatedAttendance;
  }

  // Medals
  async getMedals(): Promise<Medal[]> {
    return Array.from(this.medals.values());
  }

  async getMedalsByStudent(studentId: string): Promise<Medal[]> {
    return Array.from(this.medals.values()).filter(medal => medal.studentId === studentId);
  }

  async createMedal(insertMedal: InsertMedal): Promise<Medal> {
    const id = randomUUID();
    const medal: Medal = { 
      ...insertMedal, 
      id,
      createdAt: new Date(),
    };
    this.medals.set(id, medal);

    // Update student medal count
    const student = this.students.get(insertMedal.studentId);
    if (student) {
      const updates: Partial<InsertStudent> = {};
      if (insertMedal.type === 'gold') {
        updates.goldMedals = (student.goldMedals || 0) + 1;
      } else if (insertMedal.type === 'silver') {
        updates.silverMedals = (student.silverMedals || 0) + 1;
      } else if (insertMedal.type === 'bronze') {
        updates.bronzeMedals = (student.bronzeMedals || 0) + 1;
      }
      await this.updateStudent(student.id, updates);
    }

    return medal;
  }

  async deleteMedal(id: string): Promise<boolean> {
    const medal = this.medals.get(id);
    if (!medal) return false;

    // Update student medal count
    const student = this.students.get(medal.studentId);
    if (student) {
      const updates: Partial<InsertStudent> = {};
      if (medal.type === 'gold') {
        updates.goldMedals = Math.max(0, (student.goldMedals || 0) - 1);
      } else if (medal.type === 'silver') {
        updates.silverMedals = Math.max(0, (student.silverMedals || 0) - 1);
      } else if (medal.type === 'bronze') {
        updates.bronzeMedals = Math.max(0, (student.bronzeMedals || 0) - 1);
      }
      await this.updateStudent(student.id, updates);
    }

    return this.medals.delete(id);
  }

  // Products
  async getProducts(): Promise<Product[]> {
    return Array.from(this.products.values());
  }

  async getProduct(id: string): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const id = randomUUID();
    const product: Product = { 
      id,
      createdAt: new Date(),
      name: insertProduct.name,
      description: insertProduct.description ?? null, // ✅ TUZATILGAN
      image: insertProduct.image ?? null, // ✅ TUZATILGAN
      goldPrice: insertProduct.goldPrice ?? null, // ✅ TUZATILGAN
      silverPrice: insertProduct.silverPrice ?? null, // ✅ TUZATILGAN
      bronzePrice: insertProduct.bronzePrice ?? null, // ✅ TUZATILGAN
      inStock: insertProduct.inStock ?? null, // ✅ TUZATILGAN
    };
    this.products.set(id, product);
    return product;
  }

  async updateProduct(id: string, updates: Partial<InsertProduct>): Promise<Product | undefined> {
    const product = this.products.get(id);
    if (!product) return undefined;
    
    const updatedProduct = { ...product, ...updates };
    this.products.set(id, updatedProduct);
    return updatedProduct;
  }

  async deleteProduct(id: string): Promise<boolean> {
    return this.products.delete(id);
  }

  // Purchases
  async getPurchases(): Promise<Purchase[]> {
    return Array.from(this.purchases.values());
  }

  async getPurchasesByStudent(studentId: string): Promise<Purchase[]> {
    return Array.from(this.purchases.values()).filter(purchase => purchase.studentId === studentId);
  }

  async createPurchase(insertPurchase: InsertPurchase): Promise<Purchase> {
    const id = randomUUID();
    const purchase: Purchase = { 
      id,
      createdAt: new Date(),
      studentId: insertPurchase.studentId,
      productId: insertPurchase.productId,
      status: insertPurchase.status ?? null, // ✅ TUZATILGAN
      goldSpent: insertPurchase.goldSpent ?? null, // ✅ TUZATILGAN
      silverSpent: insertPurchase.silverSpent ?? null, // ✅ TUZATILGAN
      bronzeSpent: insertPurchase.bronzeSpent ?? null, // ✅ TUZATILGAN
    };
    this.purchases.set(id, purchase);

    // Deduct medals from student
    const student = this.students.get(insertPurchase.studentId);
    if (student) {
      const updates: Partial<InsertStudent> = {
        goldMedals: Math.max(0, (student.goldMedals || 0) - (insertPurchase.goldSpent || 0)),
        silverMedals: Math.max(0, (student.silverMedals || 0) - (insertPurchase.silverSpent || 0)),
        bronzeMedals: Math.max(0, (student.bronzeMedals || 0) - (insertPurchase.bronzeSpent || 0)),
      };
      await this.updateStudent(student.id, updates);
    }

    return purchase;
  }
}

export const storage = new MemStorage();
