export { };

declare global {
    type Model = string
    type BatchSize = string
    type Speaker = 'customer' | 'counselor'

    interface SmrRequestBody {
        topk: string,
        batch_size: BatchSize,
        text: string[]
    }

    interface Message {
        role: 'user' | 'context',
        content: string
    }

    interface QaRequestBody {
        model: Model,
        batch_size: BatchSize,
        messages: Message[]
    }

    interface DstRequestBody {
        current_utterance: string,
        dialogue_history: string
    }

    interface QueryRequestBody {
        model: Model,
        message: Message[]
    }
}