const splitChoices = (input) =>
  input
    .split(/\s+or\s+|\/|\?|,/i)
    .map((part) => part.trim())
    .filter(Boolean)
    .slice(0, 4);

const detectLens = (input) => {
  const normalized = input.toLowerCase();

  if (/money|buy|spend|budget|pay|price|cost/.test(normalized)) return 'budget';
  if (/relationship|friend|partner|family|text|reply|call|message/.test(normalized)) return 'relationship';
  if (/job|work|career|project|task|study|school|exam/.test(normalized)) return 'focus';
  if (/move|travel|go|visit|trip/.test(normalized)) return 'movement';

  return 'clarity';
};

const lensTips = {
  budget: 'Choose the option that protects your money, reduces regret, and still solves the real problem.',
  relationship: 'Choose the option that is honest, kind, and easiest to explain calmly later.',
  focus: 'Choose the option that creates the clearest next step and the lowest mental load.',
  movement: 'Choose the option that is safer, simpler, and easier to reverse if needed.',
  clarity: 'Choose the option that matches your values, reduces friction, and feels sustainable tomorrow.',
};

export const buildOfflineDecisionReply = ({ input, mode = 'text' }) => {
  const cleaned = input.trim().replace(/\s+/g, ' ');
  const choices = splitChoices(cleaned);
  const lens = detectLens(cleaned);
  const recommendation =
    choices.length >= 2
      ? `Best next move: lean toward "${choices[0]}".`
      : 'Best next move: choose the smallest safe action you can do in the next 10 minutes.';

  const optionsLine =
    choices.length >= 2
      ? `Options I noticed: ${choices.map((choice, index) => `${index + 1}. ${choice}`).join('  ')}`
      : 'Options I noticed: pause, simplify the question, and pick the next action instead of solving everything at once.';

  return [
    `Handled Robot ${mode === 'voice' ? 'decoded your voice note' : 'reviewed your message'} and here is the clearest path.`,
    optionsLine,
    `Decision lens: ${lensTips[lens]}`,
    recommendation,
    'If you still feel stuck, use this tie-breaker: pick the option that is easier to undo and kinder to your future self.',
  ].join('\n\n');
};

export const buildVoiceDraft = (seconds) => {
  const durationLabel = seconds > 0 ? `${seconds}s` : 'a short';
  return `Voice note (${durationLabel}) decoded into text:\nI need help deciding whether I should...`;
};
