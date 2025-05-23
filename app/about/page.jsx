import { Navigation } from "@/components/navigation"

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="pt-8">
        <Navigation activeSection="about" />
        <div className="container mx-auto pt-8 px-4 pb-12 max-w-3xl">
          <h1 className="text-3xl font-bold mb-8">ABOUT THE PROJECT</h1>

          <div className="space-y-8">
            <section>
              <h2 className="text-xl font-bold mb-4">PROJECT DESCRIPTION</h2>
              <p className="text-lg leading-relaxed">
                This project explores the intersection of visual and auditory experiences through a series of
                performance videos and their corresponding audio recordings. The work examines the relationship between
                space, movement, and sound, creating a multisensory experience for the viewer.
              </p>
              <p className="text-lg leading-relaxed mt-4">
                Each video documents a unique performance, with careful attention to the acoustic properties of the
                space. The audio recordings provide an alternative perspective on the same performances, allowing
                audiences to experience the work through different sensory channels.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-4">PEOPLE INVOLVED</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-bold">Director / Concept</h3>
                  <p>Jane Smith</p>
                </div>
                <div>
                  <h3 className="font-bold">Performance</h3>
                  <p>John Doe</p>
                </div>
                <div>
                  <h3 className="font-bold">Sound Design</h3>
                  <p>Alex Johnson</p>
                </div>
                <div>
                  <h3 className="font-bold">Videography</h3>
                  <p>Maria Garcia</p>
                </div>
                <div>
                  <h3 className="font-bold">Production</h3>
                  <p>Studio XYZ</p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-4">CONTACT</h2>
              <p>
                For more information about this project, please contact:
                <br />
                <a href="mailto:info@project.com" className="underline">
                  info@project.com
                </a>
              </p>
            </section>
          </div>
        </div>
      </div>
    </main>
  )
}
