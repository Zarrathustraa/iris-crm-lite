import { PrismaClient, ProspectStatus, Priority, ActivityType, TaskStatus } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  const prospect = await prisma.prospect.upsert({
    where: { sheetRowIndex: 0 },
    update: {},
    create: {
      businessName: 'ABC Plumbing LLC',
      contactName: 'John Smith',
      title: 'Owner',
      email: 'john@abcplumbing.com',
      phone: '(201) 555-0101',
      city: 'Newark',
      state: 'NJ',
      zip: '07101',
      serviceType: 'Plumbing',
      status: ProspectStatus.NEW,
      priority: Priority.HIGH,
      source: 'Seed',
      sheetRowIndex: 0,
    },
  })

  await prisma.activity.create({
    data: {
      prospectId: prospect.id,
      type: ActivityType.CALL,
      subject: 'Initial outreach call',
      body: 'Left voicemail, follow up in 3 days',
      outcome: 'Voicemail',
      duration: 2,
    },
  })

  await prisma.task.create({
    data: {
      prospectId: prospect.id,
      title: 'Follow up call',
      description: 'Call back after voicemail',
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      priority: Priority.HIGH,
      status: TaskStatus.PENDING,
    },
  })

  console.log('Seed complete.')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
