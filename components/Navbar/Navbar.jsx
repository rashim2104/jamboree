import Image from "next/image"
const Navbar = () => {
  return (
    <section className="nav">
      <Image src="/image/sairam_logo.svg" width={150} height={150} alt='SairamLogo'/>
      <div className="divider"></div>
      <Image src="/image/sairamdistrict.png" width={150} height={150} alt='sairamdistrict'/>
    </section>
  )
}

export default Navbar