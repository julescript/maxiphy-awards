import { notFound } from "next/navigation";
import { findPerson } from "@/data/awards";
import ClientAwardPage from "./ClientPage";

export async function generateMetadata({ params }) {
  const { year, slug: id } = await params;
  const numericYear = Number(year);
  const person = findPerson(numericYear, id);
  if (!person) {
    return { title: "Not found | Maxiphy Awards" };
  }
  return {
    title: `${person.name} | ${numericYear} Maxiphy Office Awards`,
    description: `${person.name} - ${numericYear} Maxiphy Office Awards`,
  };
}

export default async function AwardPage({ params }) {
  const { year, slug: id } = await params;
  const numericYear = Number(year);
  const person = findPerson(numericYear, id);

  if (!person) return notFound();

  return <ClientAwardPage year={numericYear} person={person} />;
}
