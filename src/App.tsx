import { useCallback, useState } from 'react';
import { Nav } from './components/Nav/Nav';
import { Hero } from './components/Hero/Hero';
import { Projects } from './components/Projects/Projects';
import { CaseStudyModal } from './components/CaseStudyModal/CaseStudyModal';
import { About } from './components/About/About';
import { Contact } from './components/Contact/Contact';
import { projects } from './data/projects';
import { ui } from './data/site';

/**
 * The whole site is one page. The only reactive state is which case study is
 * open — the starfield, the typewriter and the scroll reveals all run on refs
 * outside React so that a 60fps canvas never triggers a re-render.
 */
export function App() {
  const [modalIndex, setModalIndex] = useState<number | null>(null);

  const openProject = useCallback((index: number) => {
    setModalIndex(index);
  }, []);

  const closeProject = useCallback(() => {
    setModalIndex(null);
  }, []);

  const activeProject = modalIndex === null ? null : (projects[modalIndex] ?? null);

  return (
    <>
      <a className="skipLink" href="#contenu">
        {ui.skipToContent}
      </a>

      <Nav />

      <main id="contenu">
        <Hero />
        <Projects onOpenProject={openProject} />
        <About />
      </main>

      <Contact />

      {activeProject !== null && <CaseStudyModal project={activeProject} onClose={closeProject} />}
    </>
  );
}
