import Image from 'next/image'

interface Testimonial {
  id: string
  content: string
  author: {
    name: string
    role: string
    image: string
  }
  rating: number
}

interface SocialProofProps {
  testimonials?: Testimonial[]
}

export function SocialProof({ testimonials }: SocialProofProps) {
  return (
    <section className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-xl text-center">
          <h2 className="text-lg font-semibold leading-8 tracking-tight text-indigo-400">Testimonials</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Hear from Our Community
          </p>
        </div>
        <div className="mx-auto mt-16 flow-root max-w-2xl sm:mt-20 lg:mx-0 lg:max-w-none">
          <div className="-mt-8 sm:-mx-4 sm:columns-2 sm:text-[0] lg:columns-3">
            {testimonials?.map((testimonial) => (
              <div key={testimonial.id} className="pt-8 sm:inline-block sm:w-full sm:px-4">
                <figure className="rounded-2xl bg-zinc-800/10 p-8 text-sm leading-6">
                  <blockquote className="text-zinc-300">
                    <p>{`"${testimonial.content}"`}</p>
                  </blockquote>
                  <figcaption className="mt-6 flex items-center gap-x-4">
                    <Image
                      className="h-10 w-10 rounded-full bg-zinc-800"
                      src={testimonial.author.image}
                      alt={testimonial.author.name}
                      width={40}
                      height={40}
                    />
                    <div>
                      <div className="font-semibold text-white">{testimonial.author.name}</div>
                      <div className="text-zinc-400">{testimonial.author.role}</div>
                    </div>
                    {/* Star Rating */}
                    <div className="ml-auto flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className={`h-5 w-5 ${
                            i < testimonial.rating ? 'text-yellow-400' : 'text-zinc-600'
                          }`}
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z"
                            clipRule="evenodd"
                          />
                        </svg>
                      ))}
                    </div>
                  </figcaption>
                </figure>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
