import { defineStore } from 'pinia'
import { computed } from 'vue'
import { useMovieStore } from './movieStore'

export const useActorStore = defineStore('actor', () => {
  const getActors = computed(() => {
    const movieStore = useMovieStore()
    const actorMap = new Map()
    
    movieStore.movies.forEach(movie => {
      if (movie.actors && Array.isArray(movie.actors)) {
        movie.actors.forEach(actor => {
          if (!actorMap.has(actor)) {
            actorMap.set(actor, {
              name: actor,
              movies: []
            })
          }
          actorMap.get(actor).movies.push({
            id: movie.id,
            title: movie.title,
            cover: movie.cover,
            releaseYear: movie.releaseYear,
            mediaType: movie.mediaType
          })
        })
      }
    })

    actorMap.forEach(actor => {
      actor.movies.sort((a, b) => (b.releaseYear || 0) - (a.releaseYear || 0))
    })

    return Array.from(actorMap.values()).sort((a, b) => a.name.localeCompare(b.name))
  })

  const getActorByName = (name) => {
    return getActors.value.find(a => a.name === name)
  }

  const getActorMovieCount = (actorName) => {
    const actor = getActorByName(actorName)
    return actor ? actor.movies.length : 0
  }

  return {
    getActors,
    getActorByName,
    getActorMovieCount
  }
})
