import { Navigation } from "@/components/navigation"
import Image from "next/image"

export default function InventarPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="pt-8">
        <Navigation activeSection="inventar" />
        <div className="pt-8">
          {/* Fullscreen scrollable image */}
          <div className="relative w-full">
            <Image
              src="/public/inventar.jpg"
              alt="Inventar"
              width={3000}
              height={2000}
              className="w-full h-auto"
              priority
            />
          </div>
        </div>
      </div>
    </main>
  )
}
