import { google } from 'googleapis'
import { prisma } from './db'
import { ProspectStatus, Priority } from '@prisma/client'

interface SheetRow {
  [key: string]: string
}

function mapStatus(val: string): ProspectStatus {
  const v = (val || '').toUpperCase().replace(/\s+/g, '_')
  const map: Record<string, ProspectStatus> = {
    NEW: 'NEW',
    CONTACTED: 'CONTACTED',
    QUALIFIED: 'QUALIFIED',
    PROPOSAL: 'PROPOSAL_SENT',
    PROPOSAL_SENT: 'PROPOSAL_SENT',
    NEGOTIATING: 'NEGOTIATING',
    CLOSED_WON: 'CLOSED_WON',
    WON: 'CLOSED_WON',
    CLOSED_LOST: 'CLOSED_LOST',
    LOST: 'CLOSED_LOST',
    ON_HOLD: 'ON_HOLD',
  }
  return map[v] || 'NEW'
}

function mapPriority(val: string): Priority {
  const v = (val || '').toUpperCase()
  const map: Record<string, Priority> = {
    LOW: 'LOW', MEDIUM: 'MEDIUM', HIGH: 'HIGH', URGENT: 'URGENT',
  }
  return map[v] || 'MEDIUM'
}

function col(row: SheetRow, ...keys: string[]): string {
  for (const k of keys) {
    const val = row[k] || row[k.toLowerCase()] || row[k.toUpperCase()]
    if (val && val.trim()) return val.trim()
  }
  return ''
}

export async function importFromSheet(triggeredBy = 'manual'): Promise<{
  rowsRead: number
  rowsUpserted: number
  rowsSkipped: number
  error?: string
}> {
  const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID!
  const sheetName = process.env.GOOGLE_SHEET_NAME || 'Sheet1'

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  })

  const sheets = google.sheets({ version: 'v4', auth })
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: sheetName,
  })

  const rows = res.data.values || []
  if (rows.length < 2) {
    return { rowsRead: 0, rowsUpserted: 0, rowsSkipped: 0, error: 'No data rows found' }
  }

  const headers = rows[0].map((h: string) => (h || '').trim())
  const dataRows: SheetRow[] = rows.slice(1).map((row: string[]) => {
    const obj: SheetRow = {}
    headers.forEach((h: string, i: number) => { obj[h] = row[i] || '' })
    return obj
  })

  let rowsUpserted = 0
  let rowsSkipped = 0

  for (let i = 0; i < dataRows.length; i++) {
    const row = dataRows[i]
    const businessName = col(row, 'Business Name', 'Company', 'Name', 'business_name')
    if (!businessName) { rowsSkipped++; continue }

    try {
      await prisma.prospect.upsert({
        where: { sheetRowIndex: i + 2 }, // 1-indexed, row 1 = header
        update: {
          businessName,
          contactName: col(row, 'Contact Name', 'Contact', 'Owner', 'contact_name') || null,
          title: col(row, 'Title', 'Role') || null,
          email: col(row, 'Email', 'Email Address') || null,
          phone: col(row, 'Phone', 'Phone Number', 'Cell') || null,
          website: col(row, 'Website', 'URL') || null,
          city: col(row, 'City') || null,
          state: col(row, 'State') || 'NJ',
          zip: col(row, 'Zip', 'ZIP', 'Zip Code') || null,
          address: col(row, 'Address', 'Street') || null,
          serviceType: col(row, 'Service Type', 'Trade', 'Category', 'service_type') || null,
          licenseNumber: col(row, 'License', 'License #', 'License Number') || null,
          status: mapStatus(col(row, 'Status')),
          priority: mapPriority(col(row, 'Priority')),
          notes: col(row, 'Notes', 'Comments') || null,
          assignedTo: col(row, 'Assigned To', 'Owner', 'Rep') || null,
          lastSyncedAt: new Date(),
        },
        create: {
          sheetRowIndex: i + 2,
          businessName,
          contactName: col(row, 'Contact Name', 'Contact', 'Owner', 'contact_name') || null,
          title: col(row, 'Title', 'Role') || null,
          email: col(row, 'Email', 'Email Address') || null,
          phone: col(row, 'Phone', 'Phone Number', 'Cell') || null,
          website: col(row, 'Website', 'URL') || null,
          city: col(row, 'City') || null,
          state: col(row, 'State') || 'NJ',
          zip: col(row, 'Zip', 'ZIP', 'Zip Code') || null,
          address: col(row, 'Address', 'Street') || null,
          serviceType: col(row, 'Service Type', 'Trade', 'Category', 'service_type') || null,
          licenseNumber: col(row, 'License', 'License #', 'License Number') || null,
          status: mapStatus(col(row, 'Status')),
          priority: mapPriority(col(row, 'Priority')),
          notes: col(row, 'Notes', 'Comments') || null,
          assignedTo: col(row, 'Assigned To', 'Owner', 'Rep') || null,
          source: 'Google Sheet Import',
          lastSyncedAt: new Date(),
        },
      })
      rowsUpserted++
    } catch (e) {
      rowsSkipped++
    }
  }

  await prisma.syncLog.create({
    data: {
      status: 'success',
      rowsRead: dataRows.length,
      rowsUpserted,
      rowsSkipped,
      triggeredBy,
    },
  })

  return { rowsRead: dataRows.length, rowsUpserted, rowsSkipped }
}

// CLI entry point
if (require.main === module) {
  importFromSheet('cli')
    .then(r => console.log('Import complete:', r))
    .catch(console.error)
    .finally(() => prisma.$disconnect())
}
