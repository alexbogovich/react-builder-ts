import React, { Component } from 'react'
import { InlineStyleAware } from '../../common/Builder/InlineStyleAware'
import withBuilderExtension from '../HOC/withBuilderExtension'
import { Button, Card, CardActions, CardContent, CardMedia, Typography } from '@material-ui/core'
import { TypographyProps } from '@material-ui/core/Typography'
import { ButtonProps } from '@material-ui/core/Button/Button'
import { CardMediaProps } from '@material-ui/core/CardMedia/CardMedia'

interface ITextAware {
    text: string
}

interface ISuperCard extends InlineStyleAware {
    textContent: Array<ITextAware & TypographyProps & InlineStyleAware>
    actions: Array<ITextAware & ButtonProps & InlineStyleAware>
    img?: CardMediaProps & InlineStyleAware
}

class SuperCard extends Component<ISuperCard> {
    render() {
        console.log(this.props)
        const { textContent, actions, img, style } = this.props as ISuperCard

        return (
            <Card style={style}>
                {img ? <CardMedia {...img}/> : null}
                <CardContent>
                    {textContent.map(({ text, ...contentProps }) => (
                        <Typography {...contentProps}>{text}</Typography>
                    ))}
                </CardContent>
                <CardActions>
                    {actions.map(({ text, ...actionProps }) => (
                        <Button {...actionProps}>{text}</Button>
                    ))}
                </CardActions>
            </Card>
        )
    }
}

export default withBuilderExtension(SuperCard)
