import Image from "next/image"
const Footer = () => {
  return (
    <section className="foot">
      <Image src="/image/sairam_logo.svg" width={200} height={200} alt="Logo"/>
      <p>©️Sairam Institutions, 2025. All rights Reserved.</p>
    </section>
  )
}

export default Footer