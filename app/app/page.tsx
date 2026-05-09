import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import DocGuard from '@/components/DocGuard'

export default async function AppPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')
  return <DocGuard />
}
