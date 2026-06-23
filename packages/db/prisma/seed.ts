import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  // Clear existing data
  console.log('🧹 Clearing existing data...')
  await prisma.leaveBalance.deleteMany()
  await prisma.leaveRequest.deleteMany()
  await prisma.checkIn.deleteMany()
  await prisma.employee.deleteMany()
  await prisma.user.deleteMany()
  await prisma.settings.deleteMany()

  // Create Admin User
  console.log('👑 Creating admin user...')
  const adminPassword = await bcrypt.hash("notMusafBut021Musaf", 12)
  const adminUser = await prisma.user.create({
    data: {
      email: 'musaf@tech-021.com',
      password: adminPassword,
      role: 'ADMIN',
    },
  })

  const adminEmployee = await prisma.employee.create({
    data: {
      userId: adminUser.id,
      employeeId: 1,
      firstName: 'Musaf',
      lastName: 'Hanif',
      department: 'Lead',
      position: 'Software Engineer',
      salary: 0,
      hireDate: new Date('2025-03-01'),
      phoneNumber: '+1 (555) 123-0001',
      address: '123 Executive Blvd, Suite 100, New York, NY 10001',
      emergencyContact: 'Jane Admin (Spouse) - +1 (555) 123-0002',
      status: 'ACTIVE',
    },
  })

//   // Create HR Users
//   console.log('👥 Creating HR users...')
//   const hrPassword = await hashPassword('hr123')
//   const hrUser = await prisma.user.create({
//     data: {
//       email: 'hr@company.com',
//       password: hrPassword,
//       role: 'HR',
//     },
//   })

//   const hrEmployee = await prisma.employee.create({
//     data: {
//       userId: hrUser.id,
//       employeeId: 'EMP002',
//       firstName: 'Sarah',
//       lastName: 'Johnson',
//       department: 'Human Resources',
//       position: 'HR Director',
//       salary: 85000,
//       hireDate: new Date('2021-03-10'),
//       phoneNumber: '+1 (555) 123-0003',
//       address: '456 HR Street, Apt 5B, New York, NY 10002',
//       emergencyContact: 'Mike Johnson (Spouse) - +1 (555) 123-0004',
//       status: 'ACTIVE',
//     },
//   })

//   const hrAssistantUser = await prisma.user.create({
//     data: {
//       email: 'hr.assistant@company.com',
//       password: hrPassword,
//       role: 'HR',
//     },
//   })

//   const hrAssistantEmployee = await prisma.employee.create({
//     data: {
//       userId: hrAssistantUser.id,
//       employeeId: 'EMP003',
//       firstName: 'Lisa',
//       lastName: 'Wang',
//       department: 'Human Resources',
//       position: 'HR Assistant',
//       salary: 55000,
//       hireDate: new Date('2022-06-15'),
//       phoneNumber: '+1 (555) 123-0005',
//       address: '789 Assistant Ave, Unit 12, New York, NY 10003',
//       emergencyContact: 'David Wang (Father) - +1 (555) 123-0006',
//       status: 'ACTIVE',
//     },
//   })

//   // Create Managers
//   console.log('👨‍💼 Creating managers...')
//   const managerPassword = await hashPassword('manager123')
  
//   const engineeringManagerUser = await prisma.user.create({
//     data: {
//       email: 'engineering.manager@company.com',
//       password: managerPassword,
//       role: 'MANAGER',
//     },
//   })

//   const engineeringManager = await prisma.employee.create({
//     data: {
//       userId: engineeringManagerUser.id,
//       employeeId: 'EMP004',
//       firstName: 'Michael',
//       lastName: 'Chen',
//       department: 'Engineering',
//       position: 'Engineering Manager',
//       salary: 95000,
//       hireDate: new Date('2021-08-20'),
//       phoneNumber: '+1 (555) 123-0007',
//       address: '321 Engineering Rd, Floor 3, New York, NY 10004',
//       emergencyContact: 'Emily Chen (Wife) - +1 (555) 123-0008',
//       status: 'ACTIVE',
//     },
//   })

//   const salesManagerUser = await prisma.user.create({
//     data: {
//       email: 'sales.manager@company.com',
//       password: managerPassword,
//       role: 'MANAGER',
//     },
//   })

//   const salesManager = await prisma.employee.create({
//     data: {
//       userId: salesManagerUser.id,
//       employeeId: 'EMP005',
//       firstName: 'Alex',
//       lastName: 'Rodriguez',
//       department: 'Sales',
//       position: 'Sales Manager',
//       salary: 78000,
//       hireDate: new Date('2021-11-05'),
//       phoneNumber: '+1 (555) 123-0009',
//       address: '654 Sales Street, Apt 8C, New York, NY 10005',
//       emergencyContact: 'Maria Rodriguez (Sister) - +1 (555) 123-0010',
//       status: 'ACTIVE',
//     },
//   })

  // Create Regular Employees
  console.log('👷 Creating regular employees...')
  const employeePassword = await bcrypt.hash("zerotoone123", 12)

  const employees = [
    {
      email: 'muzammel@tech-021.com',
      employeeId: 2,
      firstName: 'Muzammil',
      lastName: 'Munur',
      department: 'Engineering',
      position: 'Full-stack Developer',
      salary: 0,
      hireDate: new Date('2025-05-05'),
      phoneNumber: '+1 (555) 123-0011',
      address: '987 To be added',
      emergencyContact: 'To be added',
    },
    {
      email: 'arehman@tech-021.com',
      employeeId: 3,
      firstName: 'Abdul',
      lastName: 'Rehman',
      department: 'Engineering',
      position: 'Frontend Developer',
      salary: 0,
      hireDate: new Date('2025-05-05'),
      phoneNumber: '+1 (555) 123-0013',
      address: 'To be added',
      emergencyContact: 'To be added',
    },
    {
      email: 'shahzaib@tech-021.com',
      employeeId: 4,
      firstName: 'Shahzaib',
      lastName: 'N/A',
      department: 'Engineering',
      position: 'Backend Developer',
      salary: 0,
      hireDate: new Date('2025-07-01'),
      phoneNumber: '+1 (555) 123-0015',
      address: 'To be updated',
      emergencyContact: 'To be updated',
    },
    {
      email: 'abdullah@tech-021.com',
      employeeId: 5,
      firstName: 'Abdullah',
      lastName: 'N/A',
      department: 'Engineering',
      position: 'Frontend Developer',
      salary: 0,
      hireDate: new Date('2025-07-15'),
      phoneNumber: '+1 (555) 123-0017',
      address: 'To be updated',
      emergencyContact: 'To be updated',
    },
  ]

  const createdEmployees = []
  for (const empData of employees) {
    const user = await prisma.user.create({
      data: {
        email: empData.email,
        password: employeePassword,
        role: 'EMPLOYEE',
      },
    })

    const employee = await prisma.employee.create({
      data: {
        userId: user.id,
        employeeId: empData.employeeId,
        firstName: empData.firstName,
        lastName: empData.lastName,
        department: empData.department,
        position: empData.position,
        salary: empData.salary,
        hireDate: empData.hireDate,
        phoneNumber: empData.phoneNumber,
        address: empData.address,
        emergencyContact: empData.emergencyContact,
        status: 'ACTIVE',
      },
    })
    createdEmployees.push(employee)
  }

  // // Create Leave Balances for all employees
  // console.log('📅 Creating leave balances...')
  // const allEmployees = [
  //   adminEmployee,
  //   ...createdEmployees,
  // ]

  // const currentYear = new Date().getFullYear()
  // const leaveTypes = ['ANNUAL', 'SICK', 'PERSONAL'] as const

  // for (const employee of allEmployees) {
  //   for (const leaveType of leaveTypes) {
  //     const totalDays = leaveType === 'ANNUAL' ? 25 : leaveType === 'SICK' ? 10 : 5
  //     await prisma.leaveBalance.create({
  //       data: {
  //         employeeId: employee.id,
  //         leaveType,
  //         totalDays,
  //         usedDays: Math.floor(Math.random() * 5), // Random used days
  //         remainingDays: totalDays - Math.floor(Math.random() * 5),
  //         year: currentYear,
  //       },
  //     })
  //   }
  // }

  // // Create sample check-ins for the past week
  // console.log('⏰ Creating sample check-ins...')
  // const today = new Date()
  // const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)

  // for (const employee of allEmployees) {
  //   // Create check-ins for the past 7 days
  //   for (let i = 0; i < 7; i++) {
  //     const checkInDate = new Date(lastWeek.getTime() + i * 24 * 60 * 60 * 1000)
      
  //     // Skip weekends (Saturday = 6, Sunday = 0)
  //     if (checkInDate.getDay() === 0 || checkInDate.getDay() === 6) continue

  //     const checkInTime = new Date(checkInDate)
  //     checkInTime.setHours(9 + Math.floor(Math.random() * 2), Math.floor(Math.random() * 60), 0, 0)

  //     const checkOutTime = new Date(checkInTime)
  //     checkOutTime.setHours(17 + Math.floor(Math.random() * 2), Math.floor(Math.random() * 60), 0, 0)

  //     const totalHours = (checkOutTime.getTime() - checkInTime.getTime()) / (1000 * 60 * 60)

  //     await prisma.checkIn.create({
  //       data: {
  //         employeeId: employee.id,
  //         checkInTime,
  //         checkOutTime,
  //         totalHours: Math.round(totalHours * 100) / 100,
  //         notes: Math.random() > 0.8 ? 'Work from home' : null,
  //         location: Math.random() > 0.8 ? 'Remote' : 'Office',
  //       },
  //     })
  //   }
  // }

  // // Create sample leave requests
  // console.log('🏖️ Creating sample leave requests...')
  // const sampleLeaveRequests = [
  //   {
  //     employeeId: createdEmployees[0].id, // David Brown
  //     leaveType: 'ANNUAL' as const,
  //     startDate: new Date('2024-03-15'),
  //     endDate: new Date('2024-03-20'),
  //     totalDays: 6,
  //     reason: 'Family vacation to Hawaii',
  //     status: 'APPROVED' as const,
  //   },
  //   {
  //     employeeId: createdEmployees[1].id, // Emily Davis
  //     leaveType: 'SICK' as const,
  //     startDate: new Date('2024-02-28'),
  //     endDate: new Date('2024-03-01'),
  //     totalDays: 4,
  //     reason: 'Flu and fever',
  //     status: 'APPROVED' as const,
  //   },
  //   {
  //     employeeId: createdEmployees[2].id, // James Wilson
  //     leaveType: 'PERSONAL' as const,
  //     startDate: new Date('2024-04-10'),
  //     endDate: new Date('2024-04-10'),
  //     totalDays: 1,
  //     reason: 'Doctor appointment',
  //     status: 'PENDING' as const,
  //   },
  //   {
  //     employeeId: createdEmployees[3].id, // Jessica Taylor
  //     leaveType: 'ANNUAL' as const,
  //     startDate: new Date('2024-05-20'),
  //     endDate: new Date('2024-05-24'),
  //     totalDays: 5,
  //     reason: 'Summer vacation with family',
  //     status: 'PENDING' as const,
  //   },
  // ]

  // for (const request of sampleLeaveRequests) {
  //   await prisma.leaveRequest.create({
  //     data: {
  //       ...request,
  //       approvedBy: request.status === 'APPROVED' ? adminEmployee.id : null,
  //       approvedAt: request.status === 'APPROVED' ? new Date() : null,
  //     },
  //   })
  // }

  // Create default settings
  console.log('⚙️ Creating default settings...')
  await prisma.settings.create({
    data: {
      companyName: 'Tech-021',
      standardWorkHours: 8,
      annualLeaveDays: 25,
      slackEnabled: false,
      emailNotifications: true,
      sessionTimeout: 480,
      passwordPolicy: 'Minimum 8 characters, must include uppercase, lowercase, number, and special character',
    },
  })

  console.log('✅ Database seeding completed successfully!')
  console.log('\n📋 Login Credentials:')
  console.log('👑 Admin: musaf@tech-021.com / notMusafBut021Musaf')
  console.log('\n📊 Created:')
  console.log('- 1 admin user')
  console.log('- 1 employee record')
  console.log('- 1 settings configuration')
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
