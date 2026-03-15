import Head from "next/head";
import Image from "next/image";
import { Inter } from "next/font/google";
import styles from "@/styles/Home.module.css";
import { useRouter } from "next/router";
import UserLayout from "@/layout/UserLayout";
import { useEffect } from "react";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const router = useRouter();

  //preload login page for faster navigation
  useEffect(() => {
    router.prefetch("/login");
  }, [router]);

  return (
    <UserLayout>
      <>
        {/*metadata for SEO */}
        <Head>
          <title>Connect - Social Platform</title>
          <meta name="description" content="A true social media platform" />
          <meta name="viewport" content="width=device-width, initial-scale=1" /> 
        </Head>

        <div className={`${styles.container} ${inter.className}`}>
          <div className={styles.mainContainer}>

            <div className={styles.mainContainer_left}>
              <p>Connect with Friends without Exaggeration</p>

              <p>A True social media platform, with stories, no bluffs!</p>

              <button
                onClick={() => {
                  router.push("/login");
                }}
                className={styles.buttonJoin}
              >
                Join Now
              </button>
            </div>

            <div className={styles.mainContainer_right}>
              <Image
                src="/images/connections.jpg"
                alt="connections"
                width={500}
                height={400}
                style={{
                  width: "100%",
                  height: "auto",
                  objectFit: "contain",
                }}
                priority
              />

            </div>

          </div>
        </div>
      </>
    </UserLayout>
  );
}