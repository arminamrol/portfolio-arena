import type { ResumeEntry } from '../resume/types'
import './ResumeEntryContent.css'

// A Resume Entry's description followed by its Highlights, shared by the Info
// Panel and the Plain Resume. It must stay free of the 3D code path, since the
// Plain Resume imports it.
export function ResumeEntryContent({ entry }: { entry: ResumeEntry }) {
  return (
    <>
      <p className="resume-entry__description">{entry.description}</p>
      {entry.highlights.length > 0 && (
        <ul className="resume-entry__highlights" aria-label="Highlights">
          {entry.highlights.map((highlight) => (
            <li key={highlight}>{highlight}</li>
          ))}
        </ul>
      )}
    </>
  )
}
