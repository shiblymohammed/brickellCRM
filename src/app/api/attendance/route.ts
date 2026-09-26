import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { z } from 'zod'

const checkSchema = z.object({
  employeeId: z.string(),
  type: z.enum(['CHECK_IN', 'CHECK_OUT']),
})

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const employeeId = searchParams.get('employeeId')
    const date = searchParams.get('date') // YYYY-MM-DD

    const targetDate = date ? new Date(date) : new Date()
    const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0))
    const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999))

    const attendance = await prisma.attendance.findMany({
      where: {
        ...(employeeId ? { employeeId } : {}),
        date: { gte: startOfDay, lte: endOfDay },
      },
      include: {
        employee: { select: { id: true, name: true, role: true } }
      },
      orderBy: { checkInTime: 'asc' }
    })

    return NextResponse.json({ attendance })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { employeeId, type } = checkSchema.parse(body)

    const today = new Date()
    const startOfDay = new Date(today.setHours(0, 0, 0, 0))
    const endOfDay = new Date(today.setHours(23, 59, 59, 999))

    let attendance = await prisma.attendance.findFirst({
      where: {
        employeeId,
        date: { gte: startOfDay, lte: endOfDay }
      }
    })

    if (type === 'CHECK_IN') {
      if (attendance) {
        return NextResponse.json({ error: 'Already checked in today' }, { status: 400 })
      }

      const checkInTime = new Date()
      const nineAM = new Date()
      nineAM.setHours(9, 0, 0, 0)
      const isLate = checkInTime > nineAM

      attendance = await prisma.attendance.create({
        data: {
          employeeId,
          date: new Date(),
          checkInTime,
          status: isLate ? 'LATE' : 'PRESENT',
        }
      })

      return NextResponse.json({
        success: true,
        type: 'CHECK_IN',
        time: checkInTime,
        status: isLate ? 'LATE' : 'PRESENT',
        attendance
      })
    }

    if (type === 'CHECK_OUT') {
      if (!attendance) {
        return NextResponse.json({ error: 'No check-in found for today' }, { status: 400 })
      }
      if (attendance.checkOutTime) {
        return NextResponse.json({ error: 'Already checked out today' }, { status: 400 })
      }

      const checkOutTime = new Date()
      const checkInTime = attendance.checkInTime!
      const hoursWorked = (checkOutTime.getTime() - checkInTime.getTime()) / (1000 * 60 * 60)
      const isHalfDay = hoursWorked < 5

      const updated = await prisma.attendance.update({
        where: { id: attendance.id },
        data: {
          checkOutTime,
          status: isHalfDay ? 'HALF_DAY' : attendance.status,
        }
      })

      return NextResponse.json({
        success: true,
        type: 'CHECK_OUT',
        time: checkOutTime,
        hoursWorked: hoursWorked.toFixed(1),
        attendance: updated
      })
    }

  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
