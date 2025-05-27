import Link from "next/link";

interface InfoCardProps {
  title: string;
  color: string;
  children: React.ReactNode;
}

function InfoCard({ title, color, children }: InfoCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className={`${color} text-white p-4 flex items-center`}>
        <h2 className="text-xl font-semibold">{title}</h2>
      </div>
      <div className="p-4">
        <ul className="space-y-3">
          {children}
        </ul>
      </div>
    </div>
  );
}

interface InfoItemProps {
  title: string;
  address?: string;
  phone?: string;
  description?: string | React.ReactNode;
  website?: string;
}

function InfoItem({ title, address, phone, description, website }: InfoItemProps) {
  return (
    <li>
      <h3 className="font-medium">{title}</h3>
      {address && <p className="text-sm text-gray-600">{address}</p>}
      {phone && (
        <p className="text-sm text-gray-600">
          <a href={`tel:${phone.replace(/[^0-9]/g, "")}`} className="hover:underline">
            {phone}
          </a>
        </p>
      )}
      {description && <p className="text-sm text-gray-600">{description}</p>}
      {website && (
        <a
          href={website}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 text-sm hover:underline flex items-center mt-1"
        >
          Visit Website
        </a>
      )}
    </li>
  );
}

export default function UsefulInfoPage() {
  return (
    <main className="container mx-auto px-4 py-8 md:py-10">
      <h1 className="text-3xl md:text-4xl font-bold mb-2">Useful Information</h1>
      <p className="text-gray-600 mb-8 max-w-3xl">
        Find important contacts and resources for the Westview community and surrounding Poinciana area.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <InfoCard title="Government" color="bg-blue-600">
          <InfoItem
            title="Osceola County"
            address="1 Courthouse Square, Kissimmee, FL 34741"
            phone="(407) 343-2300"
            website="https://www.osceola.org"
          />
          <InfoItem
            title="Polk County"
            address="330 W. Church St, Bartow, FL 33830"
            phone="(863) 534-6000"
            website="https://www.polk-county.net/"
          />
          <InfoItem
            title="Westview CDD"
            website="https://westviewsouthcdd.net/"
          />
          <InfoItem
            title="Osceola County Property Appraiser"
            phone="(407) 742-2000"
            website="https://www.property-appraiser.org/"
          />
          <InfoItem
            title="Osceola County Tax Collector"
            phone="(407) 742-4000"
            website="https://osceolataxcollector.org/"
          />
        </InfoCard>

        <InfoCard title="Utilities" color="bg-amber-500">
          <InfoItem
            title="Toho Water Authority"
            phone="(407) 944-4000"
            description="Water & Wastewater Services"
            website="https://www.tohowater.com"
          />
          <InfoItem
            title="Duke Energy"
            phone="(800) 700-4434"
            description="Electricity Services"
            website="https://www.duke-energy.com"
          />
          <InfoItem
            title="Waste Management"
            phone="(407) 843-1700"
            description="Garbage & Recycling Services"
            website="https://www.wm.com"
          />
        </InfoCard>

        <InfoCard title="Emergency" color="bg-red-600">
          <li className="bg-red-50 p-2 rounded border border-red-100">
            <h3 className="font-bold text-red-800">Emergency: 911</h3>
            <p className="text-sm text-gray-700">For life-threatening emergencies</p>
          </li>
          <InfoItem
            title="Osceola County Sheriff"
            description="Non-Emergency: (407) 348-2222"
            website="https://www.osceolasheriff.org"
          />
          <InfoItem
            title="Polk County Sheriff"
            description="Non-Emergency: (863) 298-6200"
            website="https://www.polksheriff.org/"
          />
          <InfoItem
            title="Poinciana Fire Station"
            address="4545 Pleasant Hill Rd, Kissimmee, FL 34759"
            phone="(407) 742-6000"
          />
          <InfoItem
            title="Florida Highway Patrol"
            description="Non-Emergency: (407) 737-4000"
          />
          <InfoItem
            title="Poison Control"
            phone="(800) 222-1222"
          />
        </InfoCard>

        <InfoCard title="Healthcare" color="bg-purple-600">
          <InfoItem
            title="AdventHealth ER Poinciana"
            description={<span className="text-red-600 font-semibold">Coming Soon!</span>}
          />
          <InfoItem
            title="Poinciana Medical Center"
            address="325 Cypress Pkwy, Kissimmee, FL 34758"
            phone="(407) 530-8000"
            website="https://www.poincianamedicalcenter.com"
          />
          <InfoItem
            title="Celebration Health"
            address="400 Celebration Pl, Celebration, FL 34747"
            phone="(407) 303-4000"
            website="https://www.adventhealth.com/hospital/adventhealth-celebration"
          />
          <InfoItem
            title="Osceola Regional Medical Center"
            address="700 W Oak St, Kissimmee, FL 34741"
            phone="(407) 846-4000"
            website="https://osceolaregional.com"
          />

          <InfoItem
            title="Park Place Behavioral Health Care"
            address="206 Park Place Blvd, Kissimmee, FL 34741"
            phone="(407) 846-0023"
            website="https://www.ppbh.org/"
          />
        </InfoCard>

        <InfoCard title="Schools" color="bg-indigo-600">
          <InfoItem
            title="Osceola County School District"
            address="817 Bill Beck Blvd, Kissimmee, FL 34744"
            phone="(407) 870-9000"
            website="https://www.osceolaschools.net"
          />
          <InfoItem
            title="Polk County Public Schools"
            address="1915 South Floral Ave, Bartow, FL 33830"
            phone="(863) 534-0500"
            website="https://www.polkschoolsfl.com/"
          />
          <InfoItem
            title="Valencia College Poinciana Campus"
            address="3255 Pleasant Hill Rd, Kissimmee, FL 34746"
            phone="(407) 299-5000"
            website="https://valenciacollege.edu/"
          />
        </InfoCard>

        <InfoCard title="Recreation" color="bg-green-600">
          <InfoItem
            title="Poinciana Community Park"
            address="5109 Allegheny Rd, Kissimmee, FL 34759"
            description="Playground, sports fields, walking trails"
          />
          <InfoItem
            title="Solivita"
            address="395 Village Drive, Poinciana, FL 34759"
            description="Golf courses, fitness center, pools"
            website="https://www.stonegategolf.com"
          />
          <InfoItem
            title="Lake Marion Creek Hiking Trail"
            address="7600 Lake Marion Creek Rd, Haines City, FL 33844"
            description="Nature trails and wildlife viewing"
          />
          <InfoItem
            title="Vance Harmon Complex"
            address="625 Country Club Dr, Poinciana, FL 34759"
            phone="(863) 427-2551"
            website="https://www.apvcommunity.com/the-arrington-gymnasium"
          />
          <InfoItem
            title="Disney World"
            description="~25 minutes away"
            website="https://www.disneyworld.com"
          />
        </InfoCard>

        <InfoCard title="Transportation" color="bg-orange-500">
          <InfoItem
            title="LYNX Bus Service"
            phone="(407) 841-5969"
            description="Central Florida Regional Transportation Authority
Route 601 serves Poinciana area"
            website="https://www.golynx.com"
          />
          <InfoItem
            title="SunRail - Poinciana Station"
            address="5025 South Rail Ave, Kissimmee, FL 34758"
            phone="(855) 724-5411"
            description="Commuter rail service to Orlando"
            website="https://sunrail.com"
          />
          <InfoItem
            title="Orlando International Airport (MCO)"
            phone="(407) 825-2001"
            description="~35 minutes from Poinciana"
            website="https://www.orlandoairports.net"
          />
          <InfoItem
            title="Major Highways"
            description="Poinciana Parkway
Florida Turnpike (closest access at Kissimmee)
Interstate 4 (closest access at ChampionsGate)"
          />
          <InfoItem
            title="Rideshare Services"
            description="Uber and Lyft available throughout the area"
          />
        </InfoCard>
      </div>
    </main>
  );
}
