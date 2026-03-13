
import { PrismaClient } from '@prisma/client'
import * as dotenv from 'dotenv'
import * as path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env') })

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
})

async function main() {
  console.log('Testing connection to:', process.env.DATABASE_URL?.split('@')[1])
  try {
    const users = await prisma.user.findMany({ take: 1 })
    console.log('Successfully connected to DB. User count (peek):', users.length)
  } catch (e: any) {
    console.error('DB Connection Failed:', e.message)
    if (e.code) console.error('Error Code:', e.code)
  } finally {
    await prisma.$disconnect()
  }
}

main()
