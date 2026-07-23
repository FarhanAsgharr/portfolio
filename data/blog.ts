import type { Post } from "@/types";

/**
 * Writing.
 *
 * Stored as structured blocks rather than raw markdown so the renderer stays
 * dependency-free and every post is type-checked. Swap this for MDX or a CMS
 * later without touching the page components — they only read `Post`.
 */
export const posts: Post[] = [
  {
    slug: "rag-is-a-retrieval-problem",
    title: "RAG is a retrieval problem, not a prompting problem",
    excerpt:
      "Most teams tune the prompt when the answer is wrong. The answer is usually wrong because the right chunk never made it into the context.",
    date: "2025-06-18",
    readingTime: 8,
    tags: ["RAG", "Retrieval", "Evaluation"],
    body: [
      {
        type: "p",
        text: "When a retrieval-augmented system gives a bad answer, the instinct is to rewrite the prompt. It feels like the cheapest lever, and occasionally it works. But in every production system I've debugged, the failure was upstream: the passage containing the answer was never retrieved, so no amount of instruction could have saved it.",
      },
      { type: "h2", text: "Measure retrieval separately" },
      {
        type: "p",
        text: "Before you can improve anything you need two numbers, not one. Recall@k tells you whether the right passage was in the candidate set at all. Answer accuracy tells you what the model did with it. Collapsing these into a single end-to-end score hides which half is broken, and teams end up tuning the half that already worked.",
      },
      {
        type: "quote",
        text: "If recall@10 is 62%, your ceiling is 62%. The prompt cannot retrieve what the retriever missed.",
      },
      { type: "h2", text: "Hybrid search is not optional" },
      {
        type: "p",
        text: "Dense retrieval handles paraphrase well and exact identifiers badly. Ask a vector index for policy PL-4471 and it will confidently return five passages about adjacent policies. Lexical search handles the opposite case. Running both and merging the candidate sets before a reranker costs one extra query and typically moves recall by double digits.",
      },
      {
        type: "code",
        text: "candidates = dense(query, k=50) | bm25(query, k=50)\nranked = cross_encoder.rerank(query, candidates)[:8]",
      },
      { type: "h2", text: "Chunking is a corpus decision" },
      {
        type: "p",
        text: "There is no universally correct chunk size. Legal documents reward large chunks with generous overlap because the qualifying clause is three paragraphs from the rule. API documentation rewards small ones because each endpoint is self-contained. Pick the strategy by looking at your corpus and measuring, not by copying a tutorial written against a different one.",
      },
      { type: "h2", text: "Build the eval set before the feature" },
      {
        type: "p",
        text: "A hundred graded question–answer pairs, written by someone who knows the domain, will do more for your system than any model upgrade. It turns every prompt change from an argument into a measurement, and it's the only thing that makes a regression visible before a user finds it.",
      },
    ],
  },
  {
    slug: "agents-need-replay",
    title: "Your agent needs a replay button more than it needs a better model",
    excerpt:
      "An agent that fails differently every run is not debuggable. Record the trace, make it replayable, and the whole class of problem becomes ordinary engineering.",
    date: "2025-04-02",
    readingTime: 6,
    tags: ["Agents", "Observability", "Debugging"],
    body: [
      {
        type: "p",
        text: "The first agent I shipped worked beautifully in demos and failed roughly one run in six in production. We couldn't reproduce a single failure, because each run took a different path and our logs recorded only the final answer. We spent two weeks arguing about which model to switch to. The model wasn't the problem.",
      },
      { type: "h2", text: "Make the run the unit of work" },
      {
        type: "p",
        text: "Every model call, tool invocation, retry and intermediate decision goes into an append-only trace, with its full inputs. Not a log line — a structured record you can deserialise. Once that exists, a replay executor can re-run the trace against the recorded responses, and a failure from last Tuesday becomes something you can step through today.",
      },
      {
        type: "quote",
        text: "Debugging went from days to minutes. Nothing about the model changed.",
      },
      { type: "h2", text: "Budget ceilings catch what tests don't" },
      {
        type: "p",
        text: "Give every run a hard token and cost ceiling, and degrade gracefully when it's hit rather than failing. In our first month this caught three runaway loops that our test suite never triggered — the kind of bug you otherwise discover on the invoice.",
      },
      { type: "h2", text: "Typed tools, validated at the boundary" },
      {
        type: "p",
        text: "Validate tool arguments against a schema at call time, and return the validation error to the model as a normal tool result. Models are good at correcting a specific, well-phrased error and bad at guessing why a call silently did nothing.",
      },
    ],
  },
  {
    slug: "streaming-ui-honest-latency",
    title: "Streaming UI is how you tell the truth about latency",
    excerpt:
      "A spinner says “wait”. A stream says “here's what I have so far”. The second one is both faster and more honest, and only one of them is a design decision.",
    date: "2025-01-27",
    readingTime: 5,
    tags: ["Next.js", "Performance", "Interface"],
    body: [
      {
        type: "p",
        text: "Perceived performance is not a trick. If your system genuinely has partial results at 300ms and a complete answer at 4s, showing the partial result isn't a sleight of hand — it's an accurate report of what the system knows.",
      },
      { type: "h2", text: "Stream every stage, not just the last one" },
      {
        type: "p",
        text: "Most teams stream the model's tokens and nothing else. But retrieval, reranking and tool calls all produce intermediate state worth showing: which documents were found, which tool is running. A user watching “searching 412,000 documents → found 8 candidates → drafting” understands the wait. A user watching a spinner assumes you're broken.",
      },
      { type: "h2", text: "Design the failure state first" },
      {
        type: "p",
        text: "Streams break mid-flight, models rate-limit, tools time out. Decide what the interface says in each case before you build the happy path, because retrofitting an error state onto a streaming UI means unpicking every assumption you made about the response arriving whole.",
      },
      {
        type: "code",
        text: "for await (const event of stream) {\n  if (event.type === 'error') return showRecovery(event)\n  append(event.delta)\n}",
      },
      { type: "h2", text: "Reserve the space" },
      {
        type: "p",
        text: "Streamed content that pushes the page around as it arrives is worse than a spinner. Reserve the container's minimum height up front so the layout settles once, at the start, rather than on every chunk.",
      },
    ],
  },
];

export function getPost(slug: string) {
  return posts.find((post) => post.slug === slug);
}
