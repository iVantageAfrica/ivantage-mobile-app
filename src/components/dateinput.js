import React, { useEffect, useState } from 'react';
import {  HStack, Select } from 'native-base';
import Shared from '../themes/shared';
import AlertBox from './alertbox';

const DateInput = (props) => {
    const { asFarBackAs = -1, isFutureDate=false, noOfYrs = 100 } = props
    const monthsWith30Days = ['04', '06', '09', '11']
    const [years, setYears] = useState([])
    const [months, setMonths] = useState([])
    const [day, setDay] = useState([])

    const [selectedYear, setYear] = useState('')
    const [selectedMonth, setMonth] = useState('')
    const [selectedDay, setSelectedDay] = useState('')

    useEffect(() => {
        generateYears()
    }, [])

    const generateYears = () => {
        const currentYear = isFutureDate ? (new Date()).getFullYear() : (new Date()).getFullYear() + asFarBackAs; // Year allowed to create a bank account.
        const validYears = [];
        for (let i = 0; i < noOfYrs; i++) {
            if(isFutureDate) {
                validYears.push((currentYear + i).toString())
            }else {
                validYears.push((currentYear - i).toString())
            }
        }
        setYears(validYears)
    }

    const generateMonths = (yr) => {
        let startAt = 1
        const d = new Date()
        if(isFutureDate && d.getFullYear() == yr) {
            startAt = d.getMonth() + 1
        }
        const validMonths = [];
        for (let i = startAt; i <= 12; i++) {
            if (i < 10) {
                validMonths.push('0' + i)
            } else {
                validMonths.push(i.toString())
            }
        }
        setMonths(validMonths)
    }

    const generateDays = (monthSelected) => {
        let endAt = 31
        if (monthsWith30Days.includes(monthSelected)) {
            endAt = 30
        } else if (monthSelected == '02') {
            endAt = 29
        }
        const validDay = [];
        for (let i = 1; i <= endAt; i++) {
            if (i < 10) {
                validDay.push('0' + i)
            } else {
                validDay.push(i.toString())
            }
        }
        setMonth(monthSelected.toString())
        setDay(validDay)
    }

    const composeDate = (day) => {
        if(!selectedDay && !day) { return false }
        let d = selectedYear + '-' + selectedMonth + '-' + ( day || selectedDayå)
        const t = new Date(d)
        return isNaN(t) ? false : t
    }

    const isPastDate = (_date) => {
        const t = new Date()
        return t > _date
    }

    return (
        <HStack space={3} paddingRight={5}>
            <Select onValueChange={(v) => {
                setYear(v.toString())
                generateMonths(v)
            }} value={selectedYear} placeholder={'Year'} bgColor={'#ffffff'} borderRadius={20} w={'100'} style={{ ...Shared.Select.default }} variant={'rounded'}>
                {years && years.map(y => <Select.Item key={y} label={y} value={y} />)}
            </Select>
            <Select
                value={selectedMonth}
                onValueChange={(e) => generateDays(e)}
                placeholder={'Month'} bgColor={'#ffffff'} borderRadius={20} w={'100'} style={{ ...Shared.Select.default }} variant={'rounded'}>
                {months && months.map(y => <Select.Item key={y} label={y} value={y} />)}
            </Select>
            <Select onValueChange={(v) => {
                setSelectedDay(v.toString())
                const _date = composeDate(v.toString())
                if(isFutureDate && isPastDate(_date)){
                    AlertBox.showError('Past dates cannot be selected.', 'Invalid Date')
                    return
                }
                
                if (_date && props.onDateSelected && typeof props.onDateSelected === 'function') {
                    props.onDateSelected(_date)
                }
            }} placeholder={'Day'} value={selectedDay} bgColor={'#ffffff'} borderRadius={20} w={'100'} style={{ ...Shared.Select.default }} variant={'rounded'}>
                {day && day.map(y => <Select.Item key={y} label={y} value={y} />)}
            </Select>

        </HStack>)
}

export default DateInput