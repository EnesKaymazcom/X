import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { createSupabaseServerClient } from '@fishivo/api/client/supabase.server'
import CatchDetailClient from './catch-detail-client'

interface PostDetailPageProps {
  params: Promise<{
    slug: string
    locale: string
  }>
}

export async function generateMetadata({ params }: PostDetailPageProps): Promise<Metadata> {
  const { slug, locale } = await params
  const supabase = await createSupabaseServerClient()
  
  const { data: post } = await supabase
    .from('posts')
    .select(`
      *,
      user:users!user_id(
        id,
        username,
        full_name,
        avatar_url,
        country_code
      ),
      catch_details
    `)
    .eq('slug', slug)
    .single()
  
  if (!post) {
    return {
      title: 'Post Not Found | Fishivo',
    }
  }

  // Get fish species data for correct language
  let species = null
  if (post.catch_details?.species_id) {
    const { data: speciesData } = await supabase
      .from('fish_species')
      .select('common_name, common_names_tr, common_names_en')
      .eq('id', post.catch_details.species_id)
      .single()
    species = speciesData
  }

  // Select fish name based on locale
  const fishSpecies = (locale === 'tr' ? 
      species?.common_names_tr?.[0] : 
      species?.common_names_en?.[0]
    ) || species?.common_name || post.catch_details?.species || 'Fish'
    
  const weight = post.catch_details?.weight ? `${post.catch_details.weight}${post.catch_details?.weight_unit || 'kg'}` : ''
  
  // Localized description
  const description = locale === 'tr' 
    ? `🎣 ${post.user.full_name || post.user.username} ${fishSpecies} yakaladı! ${weight}`
    : `🎣 ${post.user.full_name || post.user.username} caught a ${fishSpecies}! ${weight}`
    
  const imageUrl = post.images?.[0] || post.image_url

  return {
    title: locale === 'tr' 
      ? `${fishSpecies} avı - ${post.user.full_name || post.user.username} | Fishivo`
      : `${fishSpecies} catch by ${post.user.full_name || post.user.username} | Fishivo`,
    description,
    openGraph: {
      title: locale === 'tr' ? `${fishSpecies} avı | Fishivo` : `${fishSpecies} catch | Fishivo`,
      description,
      images: imageUrl ? [imageUrl] : [],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: locale === 'tr' ? `${fishSpecies} avı | Fishivo` : `${fishSpecies} catch | Fishivo`,
      description,
      images: imageUrl ? [imageUrl] : [],
    },
  }
}

export default async function PostDetailPage({ params }: PostDetailPageProps) {
  const { slug, locale } = await params
  const supabase = await createSupabaseServerClient()
  
  // Get post details with user info
  const { data: post, error } = await supabase
    .from('posts')
    .select(`
      *,
      user:users!user_id(
        id,
        username,
        full_name,
        avatar_url,
        location,
        country_code,
        is_pro
      )
    `)
    .eq('slug', slug)
    .single()
  
  if (error || !post) {
    notFound()
  }

  // Get fish species data if species_id exists
  let species = null
  if (post.catch_details?.species_id) {
    const { data: speciesData } = await supabase
      .from('fish_species')
      .select(`
        id,
        common_name,
        scientific_name,
        common_names_tr,
        common_names_en,
        description_tr,
        description_en,
        max_length,
        max_weight,
        min_depth,
        max_depth,
        habitats,
        feeding_types,
        conservation_status,
        image_url,
        slug
      `)
      .eq('id', post.catch_details.species_id)
      .single()
    
    species = speciesData
  }

  // Get current user
  const { data: { session } } = await supabase.auth.getSession()
  const currentUser = session?.user

  // Get post statistics
  const [
    { count: likeCount },
    { count: commentCount },
    { data: userLike }
  ] = await Promise.all([
    supabase
      .from('post_likes')
      .select('*', { count: 'exact', head: true })
      .eq('post_id', post.id),
    supabase
      .from('comments')
      .select('*', { count: 'exact', head: true })
      .eq('post_id', post.id),
    currentUser ? supabase
      .from('post_likes')
      .select('*')
      .eq('post_id', post.id)
      .eq('user_id', currentUser.id)
      .single() : Promise.resolve({ data: null })
  ])

  const postData = {
    ...post,
    species: species, // Balık türü bilgileri
    fish_species: (locale === 'tr' ? species?.common_names_tr?.[0] : species?.common_names_en?.[0]) || 
      species?.common_name || 
      post.catch_details?.species || '',
    fish_species_id: post.catch_details?.species_id,
    fish_species_image: species?.image_url || post.catch_details?.species_image,
    weight: post.catch_details?.weight,
    weight_unit: post.catch_details?.weight_unit,
    length: post.catch_details?.length,
    length_unit: post.catch_details?.length_unit,
    method: post.catch_details?.technique || post.catch_details?.method,
    released: post.catch_details?.released || false,
    equipment: post.catch_details?.gear || [],
    weather: post.catch_details?.weather ? {
      temperature: post.catch_details?.weather?.temperature,
      wind: post.catch_details?.weather?.wind_speed,
      pressure: post.catch_details?.weather?.pressure,
      condition: post.catch_details?.weather?.description
    } : null,
    likes: likeCount || 0,
    comments: commentCount || 0,
    isLiked: !!userLike,
    currentUserId: currentUser?.id
  }

  return <CatchDetailClient postData={postData} />
}