
import { miequipo } from "../lib/data";
import { Jugador } from "@/libs/data";
import PlayButton from "./PlayButton.astro";

interface Props {
  miequipo: miequipo;
}


<a
  href={`/miequipo/${miequipo.id}`}
  //class="playlist-card p-4 flex-col items-center group relative transition-all duration-300 overflow-hidden gap-5 rounded-md shadow-lg hover:shadow-xl outline-none bg-zinc-500/5 hover:bg-zinc-500/20 focus:bg-zinc-500/20"
  data-color={miequipo.color.dark}
  transition={{ name: `miequipo ${miequipo.id} box` }}
  transition:name=`miequipo ${miequipo.id} box`
>
  <div class="w-40">
    <div class="relative group mx-auto h-40 w-full flex-none shadow-lg">
      <img
        src={miequipo.cover}
        alt={miequipo.title}
        class="object-cover h-full w-full rounded-md shadow-[5px_0_30px_0px_rgba(0,0,0,0.3)]"
        transition:name=`miequipo ${miequipo.id} image`
      />
      <div
        class="absolute right-2 bottom-2 translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all"
        transition:name=`miequipo ${miequipo.id} play`
      >
        <PlayButton />
      </div>
    </div>
    <div class="pt-2">
      <div
        class="font-bold block truncate"
        transition:name=`miequipo ${miequipo.id} title`
      >
        {miequipo.title}
      </div>
      <div class="text-gray-400 text-xs">
        <PureInlineArtists artists={miequipo.artists} />
      </div>
    </div>
  </div>
</a>