import ProjectPage, { Points, ProjectSection } from "@/components/projects/ProjectPage";
import { projectMetadata } from "@/components/projects/metadata";

const SLUG = "llm-accelerator";

export const metadata = projectMetadata(SLUG, {
  description: "I-BERT inference on a PYNQ FPGA using pipelined SystemVerilog compute units.",
});

export default function LLMAcceleratorPage() {
  return (
    <ProjectPage
      slug={SLUG}
      summary="I-BERT inference on a PYNQ FPGA, with a focus on hardware compute units and throughput."
    >
      <ProjectSection title="Overview">
        <Points
          items={[
            "Wrote and optimized RTL implementations of systolic arrays, matrix multipliers, softmax, and layer normalization for synthesis on FPGA.",
            "Developed a suite of throughput-optimized, pipelined compute units in SystemVerilog for the PYNQ FPGA.",
          ]}
        />
      </ProjectSection>
    </ProjectPage>
  );
}
