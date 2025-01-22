import expect from 'expect'
import util from '../util'

describe('util', () => {
    describe('getFlatList', () => {
        it('should make a nest list flat', () => {
            let nestList = [1, 2, [3, 4, [5, 6, [7, 8]]]]
            let flatList = util.getFlatList(nestList)
            expect(flatList).toEqual([1, 2, 3, 4, 5, 6, 7, 8])
        })
    })

    describe('timeoutReject', () => {
        it('should reject when timeout', async () => {
            let resolveAfter10ms = new Promise((resolve) => setTimeout(resolve, 10))
            let count = 0
            try {
                await util.timeoutReject(resolveAfter10ms, 5)
            } catch (error) {
                expect(error.message.startsWith('Timeout Error'))
                count += 1
            }
            expect(count).toBe(1)
        })

        it('should not reject when it is not timeout', async () => {
            let resolveAfter5ms = new Promise((resolve) => setTimeout(resolve, 5))
            let count = 0
            try {
                await util.timeoutReject(resolveAfter5ms, 20)
            } catch (error) {
                count += 1
            }
            expect(count).toBe(0)
        })
    })

    describe('getValueByPath', () => {
        it('should support get value by path', () => {
            let obj = {
                a: {
                    b: {
                        c: {
                            d: 1,
                        },
                    },
                },
                f: 2,
            }
            let value = util.getValueByPath(obj, 'a.b.c.d')
            expect(value).toEqual(obj.a.b.c.d)
            expect(value).toEqual(1)
            expect(util.getValueByPath(obj, 'f')).toEqual(2)
        })

        it('should support get value from array', () => {
            let obj = {
                a: {
                    b: {
                        c: [
                            1,
                            2,
                            {
                                d: 4,
                            },
                        ],
                    },
                },
            }
            let value = util.getValueByPath(obj, 'a.b.c.2.d')
            expect(value).toEqual(4)
        })

        it('should support three separators', () => {
            let obj = {
                a: {
                    b: {
                        c: {
                            d: 1,
                        },
                    },
                    f: [
                        {
                            a: 1,
                        },
                        {
                            a: 2,
                        },
                        {
                            a: 3,
                        },
                    ],
                },
            }

            let path1 = ['a', 'b', 'c', 'd']
            expect(util.getValueByPath(obj, path1.join('.'))).toEqual(1)
            expect(util.getValueByPath(obj, path1.join(':'))).toEqual(1)
            expect(util.getValueByPath(obj, path1.join('/'))).toEqual(1)

            let path2 = ['a', 'f', '2', 'a']
            expect(util.getValueByPath(obj, path2.join('.'))).toEqual(3)
            expect(util.getValueByPath(obj, path2.join(':'))).toEqual(3)
            expect(util.getValueByPath(obj, path2.join('/'))).toEqual(3)
        })

        it('should throw error when path is not valid', () => {
            let obj = {
                a: 1,
            }
            expect(() => util.getValueByPath(obj, 'obj.b.c')).toThrow()
        })

        it('should return undefined when path is valid and the last key is not exist', () => {
            let obj = {
                a: 1,
                b: {
                    c: 1,
                },
            }
            expect(util.getValueByPath(obj, 'd')).toEqual(undefined)
            expect(util.getValueByPath(obj, 'b.d')).toEqual(undefined)
        })
    })

    describe('setValueByPath', () => {
        it('should set value by path without changing source data', () => {
            let obj = {
                a: {
                    b: {
                        c: 1,
                    },
                },
                f: 2,
            }
            let obj1 = util.setValueByPath(obj, 'a.b.c', 2)
            let obj2 = util.setValueByPath(obj1, 'f', 3)

            expect(obj === obj1).toBe(false)
            expect(obj1 === obj2).toBe(false)
            expect(obj === obj2).toBe(false)
            expect(obj.a.b.c).toEqual(1)
            expect(obj1.a.b.c).toEqual(2)
            expect(obj2.a.b.c).toEqual(2)
            expect(obj.f).toEqual(2)
            expect(obj1.f).toEqual(2)
            expect(obj2.f).toEqual(3)
        })

        it('should share the same data when update value', () => {
            let obj = {
                a: {
                    value: 1,
                },
                b: {
                    value: 2,
                },
                c: {
                    value: 3,
                },
            }
            let obj1 = util.setValueByPath(obj, 'a.value', 0)

            expect(obj.a === obj1.a).toBe(false)
            expect(obj.b === obj1.b).toBe(true)
            expect(obj.c === obj1.c).toBe(true)
            expect(obj.a.value).toEqual(1)
            expect(obj1.a.value).toEqual(0)
        })

        it('should support update array', () => {
            let obj = {
                list: [
                    {
                        value: 1,
                    },
                    {
                        value: 2,
                    },
                    {
                        value: 3,
                    },
                ],
            }

            let obj1 = util.setValueByPath(obj, 'list.2.value', 0)

            expect(obj.list[0] === obj1.list[0]).toBe(true)
            expect(obj.list[1] === obj1.list[1]).toBe(true)
            expect(obj.list[2] === obj1.list[2]).toBe(false)
            expect(obj.list === obj1.list).toBe(false)
            expect(obj.list[2].value).toEqual(3)
            expect(obj1.list[2].value).toEqual(0)
        })

        it('should support three separators', () => {
            let obj = {
                list: [
                    {
                        value: 1,
                    },
                    {
                        value: 2,
                    },
                    {
                        value: 3,
                    },
                ],
            }

            let obj1 = util.setValueByPath(obj, 'list.2.value', 0)
            let obj2 = util.setValueByPath(obj, 'list/2/value', 0)
            let obj3 = util.setValueByPath(obj, 'list:2:value', 0)

            expect(obj1).toEqual(obj2)
            expect(obj1).toEqual(obj3)
            expect(obj2).toEqual(obj3)
            expect(obj).toNotEqual(obj1)
        })
    })
})
