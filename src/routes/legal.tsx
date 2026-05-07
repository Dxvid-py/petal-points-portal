import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { SiteFooter } from "@/components/SiteFooter";

export default function LegalPage() {
  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Tratamiento de Datos — Puntos Deluxe</title>
        <meta
          name="description"
          content="Marco legal para el tratamiento de datos personales del Programa Puntos Deluxe — Ley 1581 de 2012."
        />
      </Helmet>

      <div className="mx-auto max-w-3xl px-6 py-14 lg:px-10">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" /> Volver al inicio
        </Link>

        <h1 className="mt-8 font-serif text-4xl font-semibold text-foreground md:text-5xl">
          Marco legal para el tratamiento de datos personales
        </h1>
        <p className="mt-3 text-sm uppercase tracking-[0.24em] text-primary">
          Programa Puntos Deluxe
        </p>

        <div className="prose prose-neutral mt-10 max-w-none text-foreground">
          <h2>1. Introducción</h2>
          <p>
            Este documento establece las directrices para el tratamiento de datos
            personales de los participantes del programa de fidelización,
            asegurando la protección de sus derechos y el cumplimiento de las
            normas legales en Colombia.
          </p>

          <h2>2. Base legal</h2>
          <ul>
            <li>Ley 1581 de 2012 — Ley General de Protección de Datos Personales.</li>
            <li>Decreto 1377 de 2013 — Reglamentación de la Ley 1581.</li>
            <li>Constitución Política de Colombia, Artículo 15.</li>
          </ul>

          <h2>3. Principios rectores</h2>
          <ol>
            <li><strong>Finalidad:</strong> los datos se usan exclusivamente para la gestión del programa de fidelización.</li>
            <li><strong>Consentimiento:</strong> autorización previa, expresa e informada del cliente.</li>
            <li><strong>Transparencia:</strong> el cliente puede consultar sus datos y conocer su uso.</li>
            <li><strong>Seguridad:</strong> protección frente a accesos no autorizados.</li>
          </ol>

          <h2>4. Autorización para el tratamiento de datos personales</h2>
          <p>
            En cumplimiento de la Ley 1581 de 2012 y el Decreto 1377 de 2013,
            <strong> autorizo de manera libre, expresa, previa e informada a
            DELUXE CORPORATION SAS</strong> para recolectar, almacenar, usar,
            procesar y compartir mis datos personales con los siguientes propósitos:
          </p>
          <ol>
            <li>Gestionar mi participación en el programa y los beneficios asociados.</li>
            <li>Realizar actividades promocionales, encuestas y análisis de preferencias.</li>
            <li>Enviar información comercial sobre productos, servicios, eventos y promociones exclusivas.</li>
          </ol>

          <h3>Finalidad del tratamiento</h3>
          <p>
            Los datos serán tratados con la única finalidad de brindar una mejor
            experiencia como participante del programa y ofrecer beneficios
            personalizados.
          </p>

          <h3>Derechos del titular</h3>
          <ol>
            <li>Conocer, actualizar y rectificar sus datos personales.</li>
            <li>Solicitar la eliminación o revocar la autorización en cualquier momento.</li>
            <li>Consultar gratuitamente sus datos personales.</li>
          </ol>
          <p>
            Para ejercer estos derechos, contáctanos al teléfono{" "}
            <a href="https://wa.me/573011940530" className="text-primary">
              +57 301 1940530
            </a>{" "}
            o al correo{" "}
            <a href="mailto:contacto.puntosdeluxe@floristeriadeluxe.com" className="text-primary">
              contacto.puntosdeluxe@floristeriadeluxe.com
            </a>.
          </p>

          <h2>5. Uso y compartimiento de los datos</h2>
          <p>
            <strong>Responsable del tratamiento:</strong> DELUXE CORPORATION SAS.
            Los datos solo serán compartidos con aliados comerciales para ofrecer
            beneficios exclusivos, previa autorización del titular.
          </p>

          <h2>6. Políticas de tratamiento y seguridad</h2>
          <ol>
            <li>Tratamiento conforme a estrictas políticas de privacidad.</li>
            <li>Medidas para prevenir acceso no autorizado, pérdida o divulgación indebida.</li>
          </ol>

          <h2>7. Derechos del cliente</h2>
          <ol>
            <li>Acceder, actualizar, rectificar o eliminar sus datos.</li>
            <li>
              Presentar quejas ante la Superintendencia de Industria y Comercio
              (SIC) si considera que sus derechos han sido vulnerados.
            </li>
          </ol>

          <h2>8. Registro de la base de datos</h2>
          <p>
            La base de datos del programa será registrada y actualizada
            periódicamente en el Registro Nacional de Bases de Datos (RNBD),
            administrado por la SIC.
          </p>

          <h2>9. Vigencia y actualización</h2>
          <p>
            Esta autorización está vigente mientras el cliente sea parte del
            programa o hasta que solicite su eliminación.
          </p>
        </div>
      </div>

      <SiteFooter />
    </div>
  );
}
