/* eslint-disable @next/next/no-async-client-component */
"use client";
import { NavbarLite } from "@/components/navbarLite";
import Carousel from "react-bootstrap/Carousel";
import Figure from "react-bootstrap/Figure";


export default async function Home() {
  return (
    <>
      <NavbarLite></NavbarLite>
      <Carousel>
        <Carousel.Item>
          <Figure.Image src="/benfica.jpg" style={{ objectFit: "cover", objectPosition: "center", width: "100%", height: "700px" }} />
          <Carousel.Caption>
          <h3>ESTADIO FANTASY</h3>
          <p>Donde sus alineaciones se hacen realidad</p>
          </Carousel.Caption>
        </Carousel.Item>
        <Carousel.Item>
          <Figure.Image src="/porto.jpg" style={{ objectFit: "cover", objectPosition: "center", width: "100%", height: "700px" }} />
          <Carousel.Caption>
            <h3>ESTADIO FANTASY</h3>
            <p>Donde sus alineaciones se hacen realidad</p>
          </Carousel.Caption>
        </Carousel.Item>
        <Carousel.Item>
          <Figure.Image src="/noucamp.jpg" style={{ objectFit: "cover", objectPosition: "center", width: "100%", height: "700px" }} />
          <Carousel.Caption>
          <h3>ESTADIO FANTASY</h3>
          <p>Donde sus alineaciones se hacen realidad</p>
          </Carousel.Caption>
        </Carousel.Item>
      </Carousel>
      
    </>
  );
}
