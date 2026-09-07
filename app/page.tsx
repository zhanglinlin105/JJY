import ArchiveExperience from "./ArchiveExperience";
import ArchiveContent from "./ArchiveContent";

export default function Home() {
  return <ArchiveExperience archive={<ArchiveContent />} />;
}
