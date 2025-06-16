import { Navigation } from '@/components/navigation';

export default function AboutPage() {
	return (
		<main className="min-h-screen bg-white">
			<div className="pt-8">
				<Navigation activeSection="about" />
				<div className="container mx-auto pt-8 px-4 pb-12 max-w-3xl">
					<h1 className="hidden font-bold mb-8">Über das Projekt</h1>
					<div className="space-y-8">
						<section>
							<p className="text-lg leading-relaxed">Verschiebung zum mithören</p>
							<p className="text-lg leading-relaxed">oder zum mitnehmen</p>
							<p className="text-lg leading-relaxed">45x von A nach B</p>
							<p className="text-lg leading-relaxed">der Raum</p>
							<p className="text-lg leading-relaxed">zwischen den Stühlen </p>
							<p className="text-lg leading-relaxed">hinterlässt seine Spuren</p>
							<p className="text-lg leading-relaxed">
								im Archiv «<bold className="font-bold">nullsiebenneun</bold>»
							</p>
						</section>

						<section>
							<div className="space-y-4">
								<div>
									<h3 className="font-bold">Soundsupport</h3>
									<p>Alex D.</p>
									<p>Basil W. </p>
								</div>
								<div>
									<h3 className="font-bold">Web Entwicklung</h3>
									<p>Simon M.</p>
								</div>
								<div>
									<h3 className="font-bold">Video</h3>
									<p>Jurek E.</p>
								</div>
								<div>
									<h3 className="font-bold">Mentoring</h3>
									<p>Christof S. </p>
								</div>
								<div>
									<h3 className="font-bold">Liebe, Halt, Freundschaft, Support</h3>
									<p>Alex D.</p>
									<p>Basil. W</p>
									<p>Ines T.</p>
									<p>Joanna J.</p>
									<p>Jurek E.</p>
									<p>Juri L.</p>
									<p>Laura C.</p>
									<p>Nadja H.</p>
									<p>Ornella S.</p>
									<p>Saiid B.</p>
									<p>Simon M.</p>
									<p>Sven M.</p>
									<p>Yannick L.</p>
								</div>
							</div>
						</section>
					</div>
				</div>
			</div>
		</main>
	);
}
