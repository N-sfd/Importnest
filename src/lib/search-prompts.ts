export type ExampleSearch = { label: string; query: string };

/** Homepage "example searches" shortcuts — each goes through the same search flow as typed input. */
export const EXAMPLE_SEARCHES: ExampleSearch[] = [
  { label: "Quiet dishwasher under $900", query: "Quiet dishwasher under $900" },
  { label: "College backpack under $100", query: "College backpack under $100" },
  { label: "Compare iPhone offers", query: "iPhone" },
  { label: "Best laptop for university", query: "Best laptop for university" },
];
