// @flow strict
'use client'

import AgentAI from '../../agent-ai/AgentAI.jsx'

function SearchSection() {
  return (
    <section className="w-full flex flex-col items-center justify-center mt-[5px] mb-[40px]">
      <AgentAI className="block" />
    </section>
  )
}

export default SearchSection