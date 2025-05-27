import { Button } from "@/components/ui/button";
import Link from "next/link";

interface FloorPlanCardProps {
  name: string;
  sqft: number;
  beds: number;
  baths: number;
  pdfLink: string;
}

function FloorPlanCard({ name, sqft, beds, baths, pdfLink }: FloorPlanCardProps) {
  return (
    <div className="bg-white p-4 rounded-md shadow-md">
      <h3 className="text-lg font-semibold">{name}</h3>
      <div className="grid grid-cols-3 gap-3 my-4 text-center">
        <div>
          <p className="font-medium">{sqft.toLocaleString()}</p>
          <p className="text-xs text-gray-500">SQ.FT</p>
        </div>
        <div>
          <p className="font-medium">{beds}</p>
          <p className="text-xs text-gray-500">BEDS</p>
        </div>
        <div>
          <p className="font-medium">{baths}</p>
          <p className="text-xs text-gray-500">BATHS</p>
        </div>
      </div>
      <Button asChild className="w-full bg-blue-600 hover:bg-blue-700">
        <Link href={pdfLink} target="_blank" rel="noopener noreferrer">View PDF</Link>
      </Button>
    </div>
  );
}

export default function FloorPlansPage() {
  return (
    <main className="container mx-auto px-4 py-8 md:py-10">
      <div className="max-w-3xl">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">
          Westview Floor Plans
        </h1>
        <p className="text-gray-600 mb-8">
          Browse our collection of floor plans from our premier home builders. Each floor plan showcases thoughtful designs and modern features to suit a variety of lifestyles and preferences.
        </p>
      </div>

      <div className="mb-8 p-6 bg-gray-50 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Skip to Builder:</h2>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" className="border-blue-600 text-blue-600">
            <Link href="#taylor-morrison">Taylor Morrison</Link>
          </Button>
          <Button asChild variant="outline" className="border-blue-600 text-blue-600">
            <Link href="#lennar">Lennar</Link>
          </Button>
        </div>
      </div>

      <section id="taylor-morrison" className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Taylor Morrison</h2>
        <p className="text-gray-600 mb-6">
          Taylor Morrison offers a variety of floor plans across multiple neighborhoods in Westview, including single-family homes and townhomes.
        </p>

        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-3">Neighborhoods:</h3>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href="#taylor-morrison-aden-north">Aden North</Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href="#taylor-morrison-aden-south">Aden South</Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href="#taylor-morrison-esplanade">Esplanade at Westview</Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href="#taylor-morrison-townhomes">Townhomes at Westview</Link>
            </Button>
          </div>
        </div>

        <div id="taylor-morrison-aden-north" className="mb-10">
          <h3 className="text-xl font-semibold mb-4">Aden North</h3>
          <p className="text-gray-600 mb-4">
            Aden North features spacious single-family homes with modern designs and premium features.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
            <FloorPlanCard name="Aruba" sqft={1768} beds={3} baths={2} pdfLink="/floor-plans/tm/aden-north/Aruba 1768 SF.pdf" />
            <FloorPlanCard name="Saint Vincent" sqft={1790} beds={3} baths={2.5} pdfLink="/floor-plans/tm/aden-north/Saint Vincent 1790 SF.pdf" />
            <FloorPlanCard name="Captiva" sqft={1989} beds={3} baths={2.5} pdfLink="/floor-plans/tm/aden-north/Captiva 1989 SF.pdf" />
            <FloorPlanCard name="Saint Thomas" sqft={2055} beds={3} baths={2.5} pdfLink="/floor-plans/tm/aden-north/Saint Thomas 2055 SF.pdf" />
            <FloorPlanCard name="Santa Rosa" sqft={2138} beds={4} baths={2.5} pdfLink="/floor-plans/tm/aden-north/Santa Rosa 2138 SF.pdf" />
            <FloorPlanCard name="Boca Grande" sqft={2197} beds={4} baths={3} pdfLink="/floor-plans/tm/aden-north/Boca Grande 2197 SF.pdf" />
            <FloorPlanCard name="Grenada" sqft={2394} beds={4} baths={3} pdfLink="/floor-plans/tm/aden-north/Grenada 2394 SF.pdf" />
            <FloorPlanCard name="Anastasia" sqft={2582} beds={4} baths={3.5} pdfLink="/floor-plans/tm/aden-north/Anastasia 2582 SF.pdf" />
            <FloorPlanCard name="Bermuda" sqft={3053} beds={5} baths={3.5} pdfLink="/floor-plans/tm/aden-north/Bermuda 3053 SF.pdf" />
            <FloorPlanCard name="Barbados" sqft={3422} beds={5} baths={4} pdfLink="/floor-plans/tm/aden-north/Barbados 3422 SF.pdf" />
          </div>

          <div className="text-right">
            <Button asChild variant="link" className="text-blue-600">
              <Link href="#taylor-morrison">Back to Taylor Morrison</Link>
            </Button>
          </div>
        </div>

        <div id="taylor-morrison-aden-south" className="mb-10">
          <h3 className="text-xl font-semibold mb-4">Aden South</h3>
          <p className="text-gray-600 mb-4">
            Aden South features a collection of versatile floor plans designed for modern living.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
            <FloorPlanCard name="Holly" sqft={1455} beds={3} baths={2} pdfLink="/floor-plans/tm/aden-south/Holly 1455 SF.pdf" />
            <FloorPlanCard name="Ambrosia" sqft={1500} beds={3} baths={2} pdfLink="/floor-plans/tm/aden-south/Ambrosia 1500 SF.pdf" />
            <FloorPlanCard name="Spruce" sqft={1603} beds={3} baths={2} pdfLink="/floor-plans/tm/aden-south/Spruce 1603 SF.pdf" />
            <FloorPlanCard name="Cypress" sqft={1848} beds={4} baths={2} pdfLink="/floor-plans/tm/aden-south/Cypress 1848 SF.pdf" />
            <FloorPlanCard name="Maple" sqft={1853} beds={4} baths={2.5} pdfLink="/floor-plans/tm/aden-south/Maple 1853 SF.pdf" />
            <FloorPlanCard name="Magnolia" sqft={2106} beds={4} baths={3} pdfLink="/floor-plans/tm/aden-south/Magnolia 2106 SF.pdf" />
            <FloorPlanCard name="Redbud" sqft={2143} beds={4} baths={3} pdfLink="/floor-plans/tm/aden-south/Redbud 2143 SF.pdf" />
            <FloorPlanCard name="Elm" sqft={2271} beds={4} baths={3} pdfLink="/floor-plans/tm/aden-south/Elm 2271 SF.pdf" />
            <FloorPlanCard name="Azalea" sqft={2287} beds={4} baths={3.5} pdfLink="/floor-plans/tm/aden-south/Azalea 2287 SF.pdf" />
            <FloorPlanCard name="Sherwood" sqft={2515} beds={5} baths={3} pdfLink="/floor-plans/tm/aden-south/Sherwood 2515 SF.pdf" />
          </div>

          <div className="text-right">
            <Button asChild variant="link" className="text-blue-600">
              <Link href="#taylor-morrison">Back to Taylor Morrison</Link>
            </Button>
          </div>
        </div>

        <div id="taylor-morrison-esplanade" className="mb-10">
          <h3 className="text-xl font-semibold mb-4">Esplanade at Westview</h3>
          <p className="text-gray-600 mb-4">
            Esplanade at Westview offers elegant floor plans with resort-style amenities and luxurious features.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
            <FloorPlanCard name="Azzurro 10'" sqft={1886} beds={2} baths={2} pdfLink="/floor-plans/tm/esplanade/Azzurro 10' 1886 SF.pdf" />
            <FloorPlanCard name="Farnese" sqft={2100} beds={2} baths={2} pdfLink="/floor-plans/tm/esplanade/Farnese 2100 SF.pdf" />
            <FloorPlanCard name="Lazio" sqft={2275} beds={3} baths={2.5} pdfLink="/floor-plans/tm/esplanade/Lazio 2275 SF.pdf" />
            <FloorPlanCard name="Ambra" sqft={2296} beds={3} baths={2.5} pdfLink="/floor-plans/tm/esplanade/Ambra 2296 SF.pdf" />
            <FloorPlanCard name="Letizia" sqft={2465} beds={3} baths={3} pdfLink="/floor-plans/tm/esplanade/Letizia 2465 SF.pdf" />
            <FloorPlanCard name="Pallazio" sqft={3004} beds={4} baths={3.5} pdfLink="/floor-plans/tm/esplanade/Pallazio 3004 SF.pdf" />
          </div>

          <div className="text-right">
            <Button asChild variant="link" className="text-blue-600">
              <Link href="#taylor-morrison">Back to Taylor Morrison</Link>
            </Button>
          </div>
        </div>

        <div id="taylor-morrison-townhomes" className="mb-10">
          <h3 className="text-xl font-semibold mb-4">Townhomes at Westview</h3>
          <p className="text-gray-600 mb-4">
            The Townhomes at Westview feature contemporary townhome designs with open-concept living spaces.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
            <FloorPlanCard name="Hazel" sqft={1205} beds={2} baths={2.5} pdfLink="/floor-plans/tm/townhomes/Hazel 1205 SF.pdf" />
            <FloorPlanCard name="Ivy" sqft={1219} beds={2} baths={2.5} pdfLink="/floor-plans/tm/townhomes/Ivy 1219 SF.pdf" />
            <FloorPlanCard name="Jasmine" sqft={1373} beds={3} baths={2.5} pdfLink="/floor-plans/tm/townhomes/Jasmine 1373 SF.pdf" />
            <FloorPlanCard name="Marigold" sqft={1553} beds={3} baths={2.5} pdfLink="/floor-plans/tm/townhomes/Marigold 1553 SF.pdf" />
          </div>

          <div className="text-right">
            <Button asChild variant="link" className="text-blue-600">
              <Link href="#taylor-morrison">Back to Taylor Morrison</Link>
            </Button>
          </div>
        </div>
      </section>

      <section id="lennar" className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Lennar</h2>
        <p className="text-gray-600 mb-6">
          Lennar offers numerous floor plans across several neighborhoods in Westview, with options for every lifestyle and need.
        </p>

        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-3">Neighborhoods:</h3>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href="#lennar-aden-south-1">Aden South I</Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href="#lennar-aden-south-2">Aden South II</Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href="#lennar-aden-south-3">Aden South III</Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href="#lennar-aden-south-key-1">Aden South Key I</Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href="#lennar-aden-south-key-2">Aden South Key II</Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href="#lennar-aden-south-key-3">Aden South Key III</Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href="#lennar-esplanade">Esplanade at Westview</Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href="#lennar-overlook-townhomes">Overlook Townhomes</Link>
            </Button>
          </div>
        </div>

        <div id="lennar-aden-south-1" className="mb-10">
          <h3 className="text-xl font-semibold mb-4">Aden South I</h3>
          <p className="text-gray-600 mb-4">
            Aden South I by Lennar features contemporary floor plans designed for modern family living.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
            <FloorPlanCard name="Annapolis" sqft={1444} beds={3} baths={2} pdfLink="/floor-plans/lennar/aden-south-i/Annapolis 1444 SF.pdf" />
            <FloorPlanCard name="Atlanta" sqft={1879} beds={3} baths={2} pdfLink="/floor-plans/lennar/aden-south-i/Atlanta 1879 SF.pdf" />
            <FloorPlanCard name="Boston" sqft={2216} beds={3} baths={2.5} pdfLink="/floor-plans/lennar/aden-south-i/Boston 2216 SF.pdf" />
            <FloorPlanCard name="Columbia" sqft={2370} beds={4} baths={3} pdfLink="/floor-plans/lennar/aden-south-i/Columbia 2370 SF.pdf" />
            <FloorPlanCard name="Concord" sqft={2575} beds={4} baths={3} pdfLink="/floor-plans/lennar/aden-south-i/Concord 2575 SF.pdf" />
          </div>

          <div className="text-right">
            <Button asChild variant="link" className="text-blue-600">
              <Link href="#lennar">Back to Lennar</Link>
            </Button>
          </div>
        </div>

        <div id="lennar-aden-south-2" className="mb-10">
          <h3 className="text-xl font-semibold mb-4">Aden South II</h3>
          <p className="text-gray-600 mb-4">
            Aden South II offers spacious single-family homes with flexible living spaces.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
            <FloorPlanCard name="Atlanta" sqft={1879} beds={3} baths={2} pdfLink="/floor-plans/lennar/aden-south-ii/Atlanta 1879 SF .pdf" />
            <FloorPlanCard name="Columbia" sqft={2370} beds={4} baths={3} pdfLink="/floor-plans/lennar/aden-south-ii/Columbia 2370 SF.pdf" />
            <FloorPlanCard name="Concord" sqft={2575} beds={4} baths={3} pdfLink="/floor-plans/lennar/aden-south-ii/Concord 2575 SF.pdf" />
          </div>

          <div className="text-right">
            <Button asChild variant="link" className="text-blue-600">
              <Link href="#lennar">Back to Lennar</Link>
            </Button>
          </div>
        </div>

        <div id="lennar-aden-south-3" className="mb-10">
          <h3 className="text-xl font-semibold mb-4">Aden South III</h3>
          <p className="text-gray-600 mb-4">
            Aden South III includes innovative home designs with open layouts and modern features.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
            <FloorPlanCard name="Dover" sqft={1555} beds={3} baths={2} pdfLink="/floor-plans/lennar/aden-south-iii/Dover 1555 SF.pdf" />
            <FloorPlanCard name="Hartford" sqft={1936} beds={4} baths={2} pdfLink="/floor-plans/lennar/aden-south-iii/Hartford 1936 SF.pdf" />
            <FloorPlanCard name="Discovery" sqft={2109} beds={4} baths={2.5} pdfLink="/floor-plans/lennar/aden-south-iii/Discovery 2109 SF.pdf" />
            <FloorPlanCard name="Miramar" sqft={2571} beds={4} baths={3.5} pdfLink="/floor-plans/lennar/aden-south-iii/Miramar 2571 SF.pdf" />
            <FloorPlanCard name="Sutton" sqft={2575} beds={5} baths={3} pdfLink="/floor-plans/lennar/aden-south-iii/Sutton 2575 SF.pdf" />
          </div>

          <div className="text-right">
            <Button asChild variant="link" className="text-blue-600">
              <Link href="#lennar">Back to Lennar</Link>
            </Button>
          </div>
        </div>

        <div id="lennar-aden-south-key-1" className="mb-10">
          <h3 className="text-xl font-semibold mb-4">Aden South Key I</h3>
          <p className="text-gray-600 mb-4">
            Aden South Key I features contemporary homes designed for efficiency and comfort.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
            <FloorPlanCard name="Belmont" sqft={1429} beds={3} baths={2} pdfLink="/floor-plans/lennar/aden-south-key-i/Belmont 1429 SF.pdf" />
            <FloorPlanCard name="Columbus" sqft={1880} beds={3} baths={2} pdfLink="/floor-plans/lennar/aden-south-key-i/Columbus 1880 SF.pdf" />
          </div>

          <div className="text-right">
            <Button asChild variant="link" className="text-blue-600">
              <Link href="#lennar">Back to Lennar</Link>
            </Button>
          </div>
        </div>

        <div id="lennar-aden-south-key-2" className="mb-10">
          <h3 className="text-xl font-semibold mb-4">Aden South Key II</h3>
          <p className="text-gray-600 mb-4">
            Aden South Key II offers spacious homes with adaptable living spaces for growing families.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
            <FloorPlanCard name="Edison" sqft={2112} beds={4} baths={2.5} pdfLink="/floor-plans/lennar/aden-south-key-ii/Edison 2112 SF.pdf" />
            <FloorPlanCard name="Georgia" sqft={2326} beds={4} baths={3} pdfLink="/floor-plans/lennar/aden-south-key-ii/Georgia 2326 SF.pdf" />
            <FloorPlanCard name="Jefferson" sqft={2463} beds={5} baths={3} pdfLink="/floor-plans/lennar/aden-south-key-ii/Jefferson 2463 SF.pdf" />
          </div>

          <div className="text-right">
            <Button asChild variant="link" className="text-blue-600">
              <Link href="#lennar">Back to Lennar</Link>
            </Button>
          </div>
        </div>

        <div id="lennar-aden-south-key-3" className="mb-10">
          <h3 className="text-xl font-semibold mb-4">Aden South Key III</h3>
          <p className="text-gray-600 mb-4">
            Aden South Key III features innovative home designs with modern amenities and flexible spaces.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
            <FloorPlanCard name="Bloom" sqft={1487} beds={3} baths={2} pdfLink="/floor-plans/lennar/aden-south-key-iii/Bloom 1487 SF.pdf" />
            <FloorPlanCard name="Celeste" sqft={1824} beds={3} baths={2} pdfLink="/floor-plans/lennar/aden-south-key-iii/Celeste 1824 SF.pdf" />
            <FloorPlanCard name="Dawn" sqft={2174} beds={4} baths={3} pdfLink="/floor-plans/lennar/aden-south-key-iii/Dawn 2174 SF.pdf" />
            <FloorPlanCard name="Eclipse" sqft={2451} beds={4} baths={3} pdfLink="/floor-plans/lennar/aden-south-key-iii/Eclipse 2451 SF.pdf" />
          </div>

          <div className="text-right">
            <Button asChild variant="link" className="text-blue-600">
              <Link href="#lennar">Back to Lennar</Link>
            </Button>
          </div>
        </div>

        <div id="lennar-esplanade" className="mb-10">
          <h3 className="text-xl font-semibold mb-4">Esplanade at Westview</h3>
          <p className="text-gray-600 mb-4">
            Esplanade at Westview by Lennar offers elegant homes in a resort-style community setting.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
            <FloorPlanCard name="Siesta" sqft={1553} beds={3} baths={2} pdfLink="/floor-plans/lennar/esplanade/Siesta 1553 SF.pdf" />
            <FloorPlanCard name="Ventura" sqft={1562} beds={3} baths={2} pdfLink="/floor-plans/lennar/esplanade/Ventura 1562 SF.pdf" />
            <FloorPlanCard name="Venice" sqft={1713} beds={3} baths={2} pdfLink="/floor-plans/lennar/esplanade/Venice 1713 SF.pdf" />
            <FloorPlanCard name="Sanibel" sqft={1872} beds={4} baths={2} pdfLink="/floor-plans/lennar/esplanade/Sanibel 1872 SF.pdf" />
          </div>

          <div className="text-right">
            <Button asChild variant="link" className="text-blue-600">
              <Link href="#lennar">Back to Lennar</Link>
            </Button>
          </div>
        </div>

        <div id="lennar-overlook-townhomes" className="mb-10">
          <h3 className="text-xl font-semibold mb-4">Overlook Townhomes</h3>
          <p className="text-gray-600 mb-4">
            Overlook Townhomes by Lennar feature contemporary townhome designs with upscale finishes.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
            <FloorPlanCard name="Amalfi" sqft={1689} beds={3} baths={2.5} pdfLink="/floor-plans/lennar/overlook-townhomes/Amalfi 1689 SF.pdf" />
            <FloorPlanCard name="Minori" sqft={1834} beds={3} baths={2.5} pdfLink="/floor-plans/lennar/overlook-townhomes/Minori 1834 SF.pdf" />
            <FloorPlanCard name="Sienna" sqft={1873} beds={3} baths={2.5} pdfLink="/floor-plans/lennar/overlook-townhomes/Sienna 1873 SF.pdf" />
          </div>

          <div className="text-right">
            <Button asChild variant="link" className="text-blue-600">
              <Link href="#lennar">Back to Lennar</Link>
            </Button>
          </div>
        </div>
      </section>

      <div className="bg-[#f8f9fa] py-8 px-6 rounded-lg mt-8">
        <h2 className="text-xl font-semibold mb-2">Need More Information?</h2>
        <p className="text-gray-600 mb-4">For more floor plans and information, please contact our sales team.</p>
        <Button asChild className="bg-blue-600 hover:bg-blue-700">
          <Link href="/contact">Contact Us</Link>
        </Button>
      </div>
    </main>
  );
}
