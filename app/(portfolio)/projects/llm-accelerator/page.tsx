import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "LLM Inference Accelerator | Lefan Hu",
  description: "IBERT inference on a PYNQ FPGA using pipelined SystemVerilog compute units.",
};

export default function LLMAcceleratorPage() {
  return (
    <div className="flex-1 overflow-auto no-scrollbar bg-black">
      <article className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
        <h1 className="text-4xl font-extrabold text-white sm:text-5xl">LLM Inference Accelerator</h1>
        <p className="mt-4 text-sm text-sky-200">Jan. 2025 - Apr. 2025 · Waterloo, ON</p>
        <ul aria-label="Technologies" className="mt-6 flex flex-wrap gap-2">
          {["SystemVerilog", "FPGA", "Vivado", "RTL Design"].map((technology) => (
            <li key={technology} className="rounded-md border border-white/10 bg-slate-800 px-3 py-1 text-sm text-slate-200">{technology}</li>
          ))}
        </ul>
        <section className="mt-8 rounded-2xl border border-white/10 bg-slate-900 p-6">
          <h2 className="text-2xl font-bold text-white">Project Overview</h2>
          <p className="mt-4 leading-8 text-slate-300">Implemented the IBERT LLM model for inference on a PYNQ FPGA, with a focus on hardware compute units and throughput.</p>
          <ul className="mt-4 list-disc space-y-3 pl-5 leading-7 text-slate-200">
            <li>Wrote and optimized RTL implementations of systolic arrays, matrix multipliers, softmax, and layer normalization for synthesis on FPGA.</li>
            <li>Developed a suite of throughput-optimized, pipelined compute units in SystemVerilog for the PYNQ FPGA.</li>
          </ul>
        </section>
      </article>
    </div>
  );
}
