type YouTubeVideo = {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  channelTitle: string;
  url: string;
};

type YouTubeApiResponse = {
  items?: Array<{
    id?: {
      videoId?: string;
    };
    snippet?: {
      title?: string;
      description?: string;
      channelTitle?: string;
      thumbnails?: {
        medium?: {
          url?: string;
        };
        default?: {
          url?: string;
        };
      };
    };
  }>;
};

export async function searchYouTube(
  query: string,
): Promise<YouTubeVideo[]> {
  const apiKey = process.env.YOUTUBE_API_KEY;

  if (!apiKey) {
    throw new Error(
      "YOUTUBE_SETUP_REQUIRED: server/.env ফাইলে YOUTUBE_API_KEY যোগ করো।",
    );
  }

  const url = new URL(
    "https://www.googleapis.com/youtube/v3/search",
  );

  url.searchParams.set("part", "snippet");
  url.searchParams.set("type", "video");
  url.searchParams.set("maxResults", "5");
  url.searchParams.set("q", query);
  url.searchParams.set("key", apiKey);

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`YOUTUBE_API_ERROR_${response.status}`);
  }

  const data =
    (await response.json()) as YouTubeApiResponse;

  return (data.items ?? [])
    .filter((item) => Boolean(item.id?.videoId))
    .map((item) => {
      const id = item.id!.videoId!;
      const snippet = item.snippet;

      return {
        id,
        title: snippet?.title ?? "Untitled video",
        description: snippet?.description ?? "",
        thumbnail:
          snippet?.thumbnails?.medium?.url ??
          snippet?.thumbnails?.default?.url ??
          "",
        channelTitle: snippet?.channelTitle ?? "Unknown channel",
        url: `https://www.youtube.com/watch?v=${id}`,
      };
    });
}