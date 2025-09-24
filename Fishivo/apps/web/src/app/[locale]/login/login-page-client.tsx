"use client"

export function LoginPageClient({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full flex justify-center">
        {children}
      </div>
    </div>
  )
}