import { getProviders, signIn } from "next-auth/react";
import { GetServerSideProps } from "next";

interface SignInProps {
  providers: any;
}

export default function SignIn({ providers }: SignInProps) {
  return (
    <div>
      <h1>Sign In</h1>
      {Object.values(providers).map((provider: any) => (
        <div key={provider.name}>
          <button onClick={() => signIn(provider.id, { callbackUrl: "/miequipo" })}>
            Sign in with {provider.name}
          </button>
        </div>
      ))}
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const providers = await getProviders();
  return {
    props: { providers },
  };
};
